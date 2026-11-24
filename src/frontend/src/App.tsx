import { Layout } from "@/components/layout/Layout";
import { EmptyState } from "@/components/layout/PageParts";
import AdminPage from "@/pages/AdminPage";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import CheckoutPage from "@/pages/CheckoutPage";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
  notFoundComponent: () => (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <EmptyState
        title="Pagina nu există"
        description="Linkul pe care l-ai deschis nu duce nicăieri. Întoarce-te la magazine."
        action={
          <Link
            to="/"
            data-ocid="notfound.home_link"
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Vezi magazinele
          </Link>
        }
      />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/magazin/$shopId",
  component: ShopPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cos",
  component: CheckoutPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/setari",
  component: AdminSettingsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  shopRoute,
  checkoutRoute,
  adminRoute,
  adminSettingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
