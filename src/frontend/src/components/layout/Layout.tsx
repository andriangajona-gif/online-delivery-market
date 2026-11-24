import { SignInButton } from "@/components/InternetIdentity";
import { useCart } from "@/hooks/useCart";
import { useIsAdmin } from "@/hooks/useQueries";
import { formatQuantity } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ShoppingBasket } from "lucide-react";

const navLinkClass =
  "rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Layout({ children }: { children: React.ReactNode }) {
  const { itemCount } = useCart();
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <Link
            to="/"
            data-ocid="nav.home_link"
            className="flex items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBasket className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Satul Meu
            </span>
          </Link>

          <nav
            aria-label="Navigare principală"
            className="ml-4 hidden items-center gap-1 md:flex"
          >
            <Link to="/" data-ocid="nav.shops_link" className={navLinkClass}>
              Magazine
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  data-ocid="nav.admin_link"
                  className={navLinkClass}
                >
                  Administrare
                </Link>
                <Link
                  to="/admin/setari"
                  data-ocid="nav.settings_link"
                  className={navLinkClass}
                >
                  Setări Telegram
                </Link>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <SignInButton className="hidden h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground transition-smooth hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 lg:inline-flex" />
            <Link
              to="/cos"
              data-ocid="nav.cart_link"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ShoppingBasket className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Coș</span>
              <span
                data-ocid="nav.cart_count"
                className="rounded-full bg-primary-foreground/20 px-2 py-0.5 font-mono text-xs"
              >
                {formatQuantity(BigInt(itemCount))}
              </span>
            </Link>
          </div>
        </div>

        {isAdmin && (
          <nav
            aria-label="Navigare administrare"
            className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden"
          >
            <Link to="/" data-ocid="nav.shops_link" className={navLinkClass}>
              Magazine
            </Link>
            <Link
              to="/admin"
              data-ocid="nav.admin_link"
              className={navLinkClass}
            >
              Administrare
            </Link>
            <Link
              to="/admin/setari"
              data-ocid="nav.settings_link"
              className={navLinkClass}
            >
              Setări Telegram
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p className="max-w-md">
            <span className="font-semibold text-foreground">
              Livrăm la domiciliu
            </span>{" "}
            — preț mic pe fiecare sat, de la 5 lei, direct la poarta ta.
          </p>
          <p>Comanda ajunge instant pe Telegram, la magazinul tău local.</p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            © {new Date().getFullYear()}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
