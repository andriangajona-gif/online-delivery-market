import {
  EmptyState,
  ErrorState,
  LoadingGrid,
  PageHeader,
} from "@/components/layout/PageParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useActiveProducts, useActiveShops } from "@/hooks/useQueries";
import { formatLei, formatQuantity } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  PackageOpen,
  Plus,
  Search,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function ShopPage() {
  const { shopId } = useParams({ from: "/magazin/$shopId" });
  const parsedShopId = useMemo(() => {
    try {
      return BigInt(shopId);
    } catch {
      return undefined;
    }
  }, [shopId]);

  const { data: shops } = useActiveShops();
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useActiveProducts(parsedShopId);
  const { addLine, itemCount, itemsTotalLei } = useCart();

  const [query, setQuery] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const shop = shops?.find((item) => String(item.id) === shopId);

  const visibleProducts = useMemo(() => {
    const list = products ?? [];
    const needle = query.trim().toLocaleLowerCase("ro-RO");
    if (!needle) return list;
    return list.filter((product) =>
      product.name.toLocaleLowerCase("ro-RO").includes(needle),
    );
  }, [products, query]);

  const handleAdd = (product: NonNullable<typeof products>[number]) => {
    addLine({
      productId: String(product.id),
      shopId: String(product.shopId),
      shopName: shop?.name ?? "Magazin local",
      productName: product.name,
      unit: product.unit,
      unitPriceLei: String(product.priceLei),
    });
    setJustAdded(String(product.id));
    window.setTimeout(() => {
      setJustAdded((current) =>
        current === String(product.id) ? null : current,
      );
    }, 1600);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Link
        to="/"
        data-ocid="shop.back_link"
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Toate magazinele
      </Link>

      <div className="mt-4">
        <PageHeader
          eyebrow="Magazin"
          title={shop?.name ?? "Produsele magazinului"}
          description={
            shop?.description ?? "Alege produsele dorite și adaugă-le în coș."
          }
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Caută un produs…"
            aria-label="Caută produs după nume"
            data-ocid="shop.search_input"
            className="h-11 rounded-full border-border bg-card pl-9 pr-4 shadow-subtle"
          />
        </div>

        <div
          data-ocid="shop.cart_summary"
          className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle sm:justify-end"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingBasket
              className="size-4 text-primary"
              aria-hidden="true"
            />
            <span>
              <span className="font-semibold text-foreground">
                {formatQuantity(BigInt(itemCount))}
              </span>{" "}
              {itemCount === 1 ? "produs" : "produse"} în coș
            </span>
          </div>
          <span className="font-display text-base font-bold text-foreground">
            {formatLei(itemsTotalLei)}
          </span>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/cos" data-ocid="shop.cart_link">
              Vezi coșul
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <LoadingGrid count={6} />
        ) : isError ? (
          <ErrorState
            title="Nu am putut încărca produsele"
            description="Verifică conexiunea și încearcă din nou."
            onRetry={() => void refetch()}
          />
        ) : (products ?? []).length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="size-6" aria-hidden="true" />}
            title="Magazinul nu are încă produse"
            description="Întoarce-te în curând — produsele sunt adăugate zilnic."
            action={
              <Button asChild className="rounded-full">
                <Link to="/" data-ocid="shop.empty_back_link">
                  Alege alt magazin
                </Link>
              </Button>
            }
          />
        ) : visibleProducts.length === 0 ? (
          <EmptyState
            icon={<Search className="size-6" aria-hidden="true" />}
            title="Niciun produs găsit"
            description={`Nu avem produse care să conțină „${query.trim()}”.`}
            action={
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                data-ocid="shop.clear_search_button"
                onClick={() => setQuery("")}
              >
                Șterge căutarea
              </Button>
            }
          />
        ) : (
          <ul
            data-ocid="shop.product_list"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6"
          >
            {visibleProducts.map((product, index) => {
              const added = justAdded === String(product.id);
              return (
                <li
                  key={String(product.id)}
                  data-ocid={`shop.product_card.${index + 1}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-secondary">
                    <img
                      src="/assets/images/placeholder.svg"
                      alt=""
                      aria-hidden="true"
                      className="size-full object-cover opacity-70"
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      <Store className="size-3" aria-hidden="true" />
                      {product.unit}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-lg font-semibold leading-snug text-foreground">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-bold text-foreground">
                          {formatLei(product.priceLei)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          pe {product.unit}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleAdd(product)}
                        data-ocid={`shop.add_button.${index + 1}`}
                        aria-label={`Adaugă ${product.name} în coș`}
                        className="rounded-full"
                      >
                        {added ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <Plus className="size-4" aria-hidden="true" />
                        )}
                        {added ? "Adăugat" : "Adaugă"}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
