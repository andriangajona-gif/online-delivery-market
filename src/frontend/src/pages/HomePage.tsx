import {
  EmptyState,
  ErrorState,
  LoadingGrid,
  PageHeader,
} from "@/components/layout/PageParts";
import { Button } from "@/components/ui/button";
import { useActiveShops } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bike,
  ClipboardList,
  MessageCircle,
  ShoppingBasket,
  Store,
} from "lucide-react";

/** Flat color band per store, keyed by a normalized store name. */
const STORE_STYLES: Record<string, { band: string; icon: string }> = {
  linella: { band: "bg-chart-1", icon: "text-chart-1" },
  bravo: { band: "bg-chart-2", icon: "text-chart-2" },
  dacidan: { band: "bg-chart-3", icon: "text-chart-3" },
  farmacie: { band: "bg-chart-4", icon: "text-chart-4" },
};

const FALLBACK_STYLES = [
  { band: "bg-chart-1", icon: "text-chart-1" },
  { band: "bg-chart-2", icon: "text-chart-2" },
  { band: "bg-chart-3", icon: "text-chart-3" },
  { band: "bg-chart-4", icon: "text-chart-4" },
];

function storeStyle(name: string, index: number) {
  const key = name.trim().toLowerCase();
  return STORE_STYLES[key] ?? FALLBACK_STYLES[index % FALLBACK_STYLES.length];
}

const STEPS = [
  {
    icon: ShoppingBasket,
    title: "Alegi magazinul",
    text: "Intri în magazinul din satul tău și pui în coș ce ai nevoie.",
  },
  {
    icon: ClipboardList,
    title: "Completezi comanda",
    text: "Alegi satul, scrii adresa și numărul de telefon, apoi trimiți comanda.",
  },
  {
    icon: MessageCircle,
    title: "Magazinul primește comanda",
    text: "Comanda ajunge instant pe Telegram la magazin, cu toate detaliile.",
  },
  {
    icon: Bike,
    title: "Primești livrarea",
    text: "Îți aducem cumpărăturile la poartă. Livrarea costă diferit pe fiecare sat.",
  },
];

export default function HomePage() {
  const { data: shops, isPending, isError, refetch } = useActiveShops();
  const list = shops ?? [];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="paper-grain border-b border-border bg-gradient-subtle">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="animate-fade-up">
            <PageHeader
              eyebrow="Magazinele satului"
              title="Cumpărăturile de la magazinele din sat, aduse la poartă"
              description="Alege magazinul, pune în coș și trimite comanda. Noi o ducem direct la magazinul local, iar cumpărăturile ajung la tine acasă."
              actions={
                <Button asChild className="rounded-full">
                  <Link to="/cos" data-ocid="home.cart_link">
                    <ShoppingBasket className="size-4" aria-hidden="true" />
                    Vezi coșul
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Shops */}
      <section
        aria-labelledby="shops-heading"
        className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Magazine disponibile
            </p>
            <h2
              id="shops-heading"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              De unde comanzi astăzi?
            </h2>
          </div>
        </div>

        <div className="mt-8">
          {isPending ? (
            <LoadingGrid count={4} />
          ) : isError ? (
            <ErrorState
              title="Nu am putut încărca magazinele"
              description="Verifică conexiunea la internet și încearcă din nou."
              onRetry={() => void refetch()}
            />
          ) : list.length === 0 ? (
            <EmptyState
              icon={<Store className="size-6" aria-hidden="true" />}
              title="Încă nu sunt magazine deschise"
              description="Magazinele din sat își pregătesc oferta. Revino în curând — în scurt timp vei putea comanda."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  data-ocid="home.refresh_button"
                  onClick={() => void refetch()}
                >
                  Reîmprospătează
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 md:gap-6">
              {list.map((shop, index) => {
                const style = storeStyle(shop.name, index);
                return (
                  <li
                    key={String(shop.id)}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <Link
                      to="/magazin/$shopId"
                      params={{ shopId: String(shop.id) }}
                      data-ocid={`home.shop_link.${index + 1}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <div
                        className={`flex items-center justify-between px-6 py-5 ${style.band}`}
                      >
                        <span className="grid size-11 place-items-center rounded-full bg-card/90 text-foreground">
                          <Store className="size-5" aria-hidden="true" />
                        </span>
                        <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                          Deschis
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-display text-xl font-semibold text-foreground">
                          {shop.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {shop.description}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          Intră în magazin
                          <ArrowRight
                            className="size-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* How it works */}
      <section
        aria-labelledby="how-heading"
        className="border-y border-border bg-muted/40"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Cum funcționează
            </p>
            <h2
              id="how-heading"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              De la coș până la poarta ta, în patru pași
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Comanzi simplu, fără cont și fără plată online. Plătești când
              primești cumpărăturile, iar livrarea se face la domiciliu în satul
              tău.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  data-ocid={`home.step.${index + 1}`}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-sm font-semibold text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {step.text}
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                Livrare la domiciliu
              </span>{" "}
              — prețul de livrare diferă pe fiecare sat și îl vezi clar la
              finalizarea comenzii.
            </p>
            <Button asChild className="rounded-full">
              <Link to="/cos" data-ocid="home.checkout_link">
                Finalizează comanda
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
