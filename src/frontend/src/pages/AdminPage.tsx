import type {
  Id,
  Locality,
  LocalityInput,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  Shop,
  ShopInput,
} from "@/backend";
import { OrderStatus as OrderStatusEnum } from "@/backend";
import { RequireSignIn, SignInButton } from "@/components/InternetIdentity";
import {
  EmptyState,
  ErrorState,
  PageHeader,
} from "@/components/layout/PageParts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAllLocalities,
  useAllProducts,
  useAllShops,
  useCreateLocality,
  useCreateProduct,
  useCreateShop,
  useDeleteLocality,
  useDeleteProduct,
  useDeleteShop,
  useIsAdmin,
  useOrders,
  useResendTelegramNotification,
  useSetOrderStatus,
  useUpdateLocality,
  useUpdateProduct,
  useUpdateShop,
} from "@/hooks/useQueries";
import { formatDateTime, formatLei, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Check,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Plus,
  RotateCw,
  Send,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";

/* ------------------------------- shared bits ------------------------------ */

const cardClass =
  "rounded-2xl border border-border bg-card shadow-card transition-smooth";

function SectionShell({
  id,
  icon,
  title,
  description,
  action,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} data-ocid={`admin.${id}.section`} className="scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            {icon}
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold text-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={cn(
        "rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold",
        active
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground",
      )}
    >
      {active ? "Activ" : "Inactiv"}
    </Badge>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  const ids = Array.from({ length: rows }, (_, i) => `admin-skeleton-${i}`);
  return (
    <div data-ocid="admin.loading_state" className="space-y-3">
      {ids.map((id) => (
        <div key={id} className={cn(cardClass, "p-4")}>
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- shops ---------------------------------- */

type ShopDraft = { name: string; description: string; sortOrder: string };

const emptyShopDraft: ShopDraft = { name: "", description: "", sortOrder: "0" };

function ShopForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ShopDraft;
  submitLabel: string;
  pending: boolean;
  error?: string;
  onSubmit: (input: ShopInput) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<ShopDraft>(initial);
  const canSubmit = draft.name.trim().length > 0 && !pending;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          name: draft.name.trim(),
          description: draft.description.trim(),
          sortOrder: BigInt(
            Math.max(0, Number.parseInt(draft.sortOrder, 10) || 0),
          ),
          active: true,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nume magazin" htmlFor="shop-name">
          <Input
            id="shop-name"
            data-ocid="admin.shop.name_input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex: Linella"
            required
          />
        </Field>
        <Field label="Ordine afișare" htmlFor="shop-order">
          <Input
            id="shop-order"
            data-ocid="admin.shop.order_input"
            type="number"
            min={0}
            value={draft.sortOrder}
            onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Descriere" htmlFor="shop-desc">
        <Textarea
          id="shop-desc"
          data-ocid="admin.shop.description_input"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Scurtă descriere a magazinului"
          rows={2}
        />
      </Field>
      {error && <InlineError message={error} />}
      <div className="flex gap-2">
        <Button
          type="submit"
          data-ocid="admin.shop.submit_button"
          disabled={!canSubmit}
          className="rounded-full"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            data-ocid="admin.shop.cancel_button"
            onClick={onCancel}
            className="rounded-full"
          >
            Anulează
          </Button>
        )}
      </div>
    </form>
  );
}

function ShopsSection() {
  const { data: shops, isLoading, isError, refetch } = useAllShops();
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionShell
      id="shops"
      icon={<Store className="size-5" aria-hidden="true" />}
      title="Magazine"
      description="Adaugă, editează sau dezactivează magazinele din catalog."
      action={
        !adding && (
          <Button
            type="button"
            data-ocid="admin.shop.open_modal_button"
            onClick={() => setAdding(true)}
            className="rounded-full"
          >
            <Plus className="size-4" aria-hidden="true" />
            Adaugă magazin
          </Button>
        )
      }
    >
      {adding && (
        <div className={cn(cardClass, "mb-4 p-5")}>
          <ShopForm
            initial={emptyShopDraft}
            submitLabel="Salvează magazinul"
            pending={createShop.isPending}
            error={createShop.isError ? createShop.error.message : undefined}
            onSubmit={(input) =>
              createShop.mutate(input, { onSuccess: () => setAdding(false) })
            }
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !shops || shops.length === 0 ? (
        <EmptyState
          icon={<Store className="size-6" aria-hidden="true" />}
          title="Niciun magazin încă"
          description="Adaugă primul magazin pentru a începe catalogul."
        />
      ) : (
        <ul data-ocid="admin.shops.list" className="space-y-3">
          {shops.map((shop, index) => (
            <li
              key={String(shop.id)}
              data-ocid={`admin.shops.item.${index + 1}`}
              className={cn(cardClass, "p-4")}
            >
              {editingId === String(shop.id) ? (
                <ShopForm
                  initial={{
                    name: shop.name,
                    description: shop.description,
                    sortOrder: String(shop.sortOrder),
                  }}
                  submitLabel="Salvează modificările"
                  pending={updateShop.isPending}
                  error={
                    updateShop.isError ? updateShop.error.message : undefined
                  }
                  onSubmit={(input) =>
                    updateShop.mutate(
                      { id: shop.id, input },
                      { onSuccess: () => setEditingId(null) },
                    )
                  }
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg font-semibold text-foreground">
                        {shop.name}
                      </h3>
                      <ActiveBadge active={shop.active} />
                    </div>
                    {shop.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {shop.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`admin.shop.toggle.${index + 1}`}
                      onClick={() =>
                        updateShop.mutate({
                          id: shop.id,
                          input: {
                            name: shop.name,
                            description: shop.description,
                            sortOrder: shop.sortOrder,
                            active: !shop.active,
                          },
                        })
                      }
                      className="rounded-full"
                    >
                      {shop.active ? "Dezactivează" : "Activează"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`admin.shop.edit_button.${index + 1}`}
                      onClick={() => setEditingId(String(shop.id))}
                      className="rounded-full"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Editează
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-ocid={`admin.shop.delete_button.${index + 1}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Ștergi magazinul „${shop.name}”? Acțiunea nu poate fi anulată.`,
                          )
                        ) {
                          deleteShop.mutate(shop.id);
                        }
                      }}
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Șterge
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

/* -------------------------------- products -------------------------------- */

type ProductDraft = {
  shopId: string;
  name: string;
  unit: string;
  price: string;
  description: string;
};

function ProductForm({
  shops,
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  shops: Shop[];
  initial: ProductDraft;
  submitLabel: string;
  pending: boolean;
  error?: string;
  onSubmit: (input: ProductInput) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const canSubmit =
    draft.name.trim().length > 0 &&
    draft.shopId !== "" &&
    draft.price.trim() !== "" &&
    !pending;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          shopId: BigInt(draft.shopId),
          name: draft.name.trim(),
          unit: draft.unit.trim() || "buc",
          priceLei: BigInt(Math.max(0, Number.parseInt(draft.price, 10) || 0)),
          description: draft.description.trim(),
          active: true,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Magazin" htmlFor="product-shop">
          <select
            id="product-shop"
            data-ocid="admin.product.shop_select"
            value={draft.shopId}
            onChange={(e) => setDraft({ ...draft, shopId: e.target.value })}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            required
          >
            <option value="">Alege magazinul</option>
            {shops.map((shop) => (
              <option key={String(shop.id)} value={String(shop.id)}>
                {shop.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nume produs" htmlFor="product-name">
          <Input
            id="product-name"
            data-ocid="admin.product.name_input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex: Lapte proaspăt"
            required
          />
        </Field>
        <Field label="Preț (lei)" htmlFor="product-price">
          <Input
            id="product-price"
            data-ocid="admin.product.price_input"
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            placeholder="0"
            required
          />
        </Field>
        <Field label="Unitate" htmlFor="product-unit">
          <Input
            id="product-unit"
            data-ocid="admin.product.unit_input"
            value={draft.unit}
            onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
            placeholder="buc / kg / litru"
          />
        </Field>
      </div>
      <Field label="Descriere" htmlFor="product-desc">
        <Textarea
          id="product-desc"
          data-ocid="admin.product.description_input"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={2}
          placeholder="Detalii scurte despre produs"
        />
      </Field>
      {error && <InlineError message={error} />}
      <div className="flex gap-2">
        <Button
          type="submit"
          data-ocid="admin.product.submit_button"
          disabled={!canSubmit}
          className="rounded-full"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            data-ocid="admin.product.cancel_button"
            onClick={onCancel}
            className="rounded-full"
          >
            Anulează
          </Button>
        )}
      </div>
    </form>
  );
}

function ProductsSection({ shops }: { shops: Shop[] }) {
  const [shopFilter, setShopFilter] = useState<string>("");
  const activeShopId = shopFilter === "" ? undefined : BigInt(shopFilter);
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useAllProducts(activeShopId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const shopName = (id: Id) =>
    shops.find((s) => String(s.id) === String(id))?.name ?? "Magazin";

  return (
    <SectionShell
      id="products"
      icon={<Package className="size-5" aria-hidden="true" />}
      title="Produse"
      description="Alege un magazin și administrează-i produsele și prețurile."
      action={
        !adding &&
        shops.length > 0 && (
          <Button
            type="button"
            data-ocid="admin.product.open_modal_button"
            onClick={() => setAdding(true)}
            className="rounded-full"
          >
            <Plus className="size-4" aria-hidden="true" />
            Adaugă produs
          </Button>
        )
      }
    >
      <div className="mb-4 max-w-xs">
        <Field label="Filtrează după magazin" htmlFor="product-filter">
          <select
            id="product-filter"
            data-ocid="admin.product.filter_select"
            value={shopFilter}
            onChange={(e) => {
              setShopFilter(e.target.value);
              setAdding(false);
              setEditingId(null);
            }}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Toate magazinele</option>
            {shops.map((shop) => (
              <option key={String(shop.id)} value={String(shop.id)}>
                {shop.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {adding && (
        <div className={cn(cardClass, "mb-4 p-5")}>
          <ProductForm
            shops={shops}
            initial={{
              shopId: shopFilter,
              name: "",
              unit: "",
              price: "",
              description: "",
            }}
            submitLabel="Salvează produsul"
            pending={createProduct.isPending}
            error={
              createProduct.isError ? createProduct.error.message : undefined
            }
            onSubmit={(input) =>
              createProduct.mutate(input, { onSuccess: () => setAdding(false) })
            }
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {shops.length === 0 ? (
        <EmptyState
          icon={<Store className="size-6" aria-hidden="true" />}
          title="Adaugă mai întâi un magazin"
          description="Produsele aparțin unui magazin. Creează unul în secțiunea Magazine."
        />
      ) : isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !products || products.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" aria-hidden="true" />}
          title="Niciun produs aici"
          description="Adaugă primul produs pentru magazinul selectat."
        />
      ) : (
        <ul data-ocid="admin.products.list" className="space-y-3">
          {products.map((product, index) => (
            <li
              key={String(product.id)}
              data-ocid={`admin.products.item.${index + 1}`}
              className={cn(cardClass, "p-4")}
            >
              {editingId === String(product.id) ? (
                <ProductForm
                  shops={shops}
                  initial={{
                    shopId: String(product.shopId),
                    name: product.name,
                    unit: product.unit,
                    price: String(product.priceLei),
                    description: product.description,
                  }}
                  submitLabel="Salvează modificările"
                  pending={updateProduct.isPending}
                  error={
                    updateProduct.isError
                      ? updateProduct.error.message
                      : undefined
                  }
                  onSubmit={(input) =>
                    updateProduct.mutate(
                      { id: product.id, input },
                      { onSuccess: () => setEditingId(null) },
                    )
                  }
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-lg font-semibold text-foreground">
                        {product.name}
                      </h3>
                      <ActiveBadge active={product.active} />
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {shopName(product.shopId)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">
                        {formatLei(product.priceLei)}
                      </span>{" "}
                      / {product.unit}
                      {product.description && ` · ${product.description}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`admin.product.toggle.${index + 1}`}
                      onClick={() =>
                        updateProduct.mutate({
                          id: product.id,
                          input: {
                            shopId: product.shopId,
                            name: product.name,
                            unit: product.unit,
                            priceLei: product.priceLei,
                            description: product.description,
                            active: !product.active,
                          },
                        })
                      }
                      className="rounded-full"
                    >
                      {product.active ? "Dezactivează" : "Activează"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`admin.product.edit_button.${index + 1}`}
                      onClick={() => setEditingId(String(product.id))}
                      className="rounded-full"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Editează
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-ocid={`admin.product.delete_button.${index + 1}`}
                      onClick={() => {
                        if (
                          window.confirm(`Ștergi produsul „${product.name}”?`)
                        ) {
                          deleteProduct.mutate(product.id);
                        }
                      }}
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Șterge
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

/* ------------------------------- localities ------------------------------- */

type LocalityDraft = { name: string; price: string };

function LocalityForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initial: LocalityDraft;
  submitLabel: string;
  pending: boolean;
  error?: string;
  onSubmit: (input: LocalityInput) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<LocalityDraft>(initial);
  const canSubmit =
    draft.name.trim().length > 0 && draft.price.trim() !== "" && !pending;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          name: draft.name.trim(),
          deliveryPriceLei: BigInt(
            Math.max(0, Number.parseInt(draft.price, 10) || 0),
          ),
          active: true,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Localitate" htmlFor="locality-name">
          <Input
            id="locality-name"
            data-ocid="admin.locality.name_input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Ex: Cojușna"
            required
          />
        </Field>
        <Field label="Preț livrare (lei)" htmlFor="locality-price">
          <Input
            id="locality-price"
            data-ocid="admin.locality.price_input"
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            placeholder="0"
            required
          />
        </Field>
      </div>
      {error && <InlineError message={error} />}
      <div className="flex gap-2">
        <Button
          type="submit"
          data-ocid="admin.locality.submit_button"
          disabled={!canSubmit}
          className="rounded-full"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            data-ocid="admin.locality.cancel_button"
            onClick={onCancel}
            className="rounded-full"
          >
            Anulează
          </Button>
        )}
      </div>
    </form>
  );
}

function parseBulkLocalities(text: string): LocalityInput[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [rawName, rawPrice] = line.split(/[;,\t]/);
      const name = (rawName ?? "").trim();
      const price = Number.parseInt((rawPrice ?? "").trim(), 10);
      if (!name || Number.isNaN(price)) return null;
      return {
        name,
        deliveryPriceLei: BigInt(Math.max(0, price)),
        active: true,
      };
    })
    .filter((item): item is LocalityInput => item !== null);
}

function LocalitiesSection() {
  const { data: localities, isLoading, isError, refetch } = useAllLocalities();
  const createLocality = useCreateLocality();
  const updateLocality = useUpdateLocality();
  const deleteLocality = useDeleteLocality();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

  const parsed = parseBulkLocalities(bulkText);

  return (
    <SectionShell
      id="localities"
      icon={<MapPin className="size-5" aria-hidden="true" />}
      title="Localități și livrare"
      description="Setează prețul de livrare pentru fiecare sat sau oraș."
      action={
        <>
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.locality.bulk_open_button"
            onClick={() => {
              setBulkOpen((v) => !v);
              setBulkError(null);
              setBulkSuccess(null);
            }}
            className="rounded-full"
          >
            <Plus className="size-4" aria-hidden="true" />
            Adaugă listă
          </Button>
          {!adding && (
            <Button
              type="button"
              data-ocid="admin.locality.open_modal_button"
              onClick={() => setAdding(true)}
              className="rounded-full"
            >
              <Plus className="size-4" aria-hidden="true" />
              Adaugă localitate
            </Button>
          )}
        </>
      }
    >
      {bulkOpen && (
        <div className={cn(cardClass, "mb-4 p-5")}>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Adaugă mai multe localități
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Scrie câte o localitate pe linie, în formatul{" "}
            <span className="font-mono text-foreground">Nume; preț</span>.
          </p>
          <div className="mt-3 space-y-3">
            <Field label="Listă localități" htmlFor="bulk-localities">
              <Textarea
                id="bulk-localities"
                data-ocid="admin.locality.bulk_textarea"
                value={bulkText}
                onChange={(e) => {
                  setBulkText(e.target.value);
                  setBulkError(null);
                  setBulkSuccess(null);
                }}
                rows={6}
                placeholder={"Cojușna; 25\nSireți; 30\nBălăurești; 35"}
                className="font-mono text-sm"
              />
            </Field>
            {bulkError && <InlineError message={bulkError} />}
            {bulkSuccess && (
              <p
                data-ocid="admin.locality.bulk_success_state"
                className="text-sm font-medium text-success"
              >
                {bulkSuccess}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                data-ocid="admin.locality.bulk_submit_button"
                disabled={parsed.length === 0 || createLocality.isPending}
                onClick={() => {
                  if (parsed.length === 0) {
                    setBulkError(
                      "Nicio linie validă. Folosește formatul „Nume; preț”.",
                    );
                    return;
                  }
                  let done = 0;
                  let failed = 0;
                  for (const input of parsed) {
                    createLocality.mutate(input, {
                      onSuccess: () => {
                        done += 1;
                        if (done + failed === parsed.length) {
                          setBulkSuccess(
                            `${done} localități adăugate${failed > 0 ? `, ${failed} eșuate` : ""}.`,
                          );
                          setBulkText("");
                        }
                      },
                      onError: () => {
                        failed += 1;
                        if (done + failed === parsed.length) {
                          setBulkError(
                            `${failed} localități nu au putut fi adăugate.`,
                          );
                        }
                      },
                    });
                  }
                }}
                className="rounded-full"
              >
                {createLocality.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                Adaugă {parsed.length > 0 ? `${parsed.length} ` : ""}localități
              </Button>
              <Button
                type="button"
                variant="ghost"
                data-ocid="admin.locality.bulk_cancel_button"
                onClick={() => {
                  setBulkOpen(false);
                  setBulkText("");
                  setBulkError(null);
                  setBulkSuccess(null);
                }}
                className="rounded-full"
              >
                Închide
              </Button>
            </div>
          </div>
        </div>
      )}

      {adding && (
        <div className={cn(cardClass, "mb-4 p-5")}>
          <LocalityForm
            initial={{ name: "", price: "" }}
            submitLabel="Salvează localitatea"
            pending={createLocality.isPending}
            error={
              createLocality.isError ? createLocality.error.message : undefined
            }
            onSubmit={(input) =>
              createLocality.mutate(input, {
                onSuccess: () => setAdding(false),
              })
            }
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !localities || localities.length === 0 ? (
        <EmptyState
          icon={<MapPin className="size-6" aria-hidden="true" />}
          title="Nicio localitate încă"
          description="Adaugă localitățile în care livrezi, cu prețul de livrare."
        />
      ) : (
        <ul data-ocid="admin.localities.list" className="space-y-3">
          {localities.map((locality, index) => (
            <li
              key={String(locality.id)}
              data-ocid={`admin.localities.item.${index + 1}`}
              className={cn(cardClass, "p-4")}
            >
              {editingId === String(locality.id) ? (
                <LocalityForm
                  initial={{
                    name: locality.name,
                    price: String(locality.deliveryPriceLei),
                  }}
                  submitLabel="Salvează modificările"
                  pending={updateLocality.isPending}
                  error={
                    updateLocality.isError
                      ? updateLocality.error.message
                      : undefined
                  }
                  onSubmit={(input) =>
                    updateLocality.mutate(
                      { id: locality.id, input },
                      { onSuccess: () => setEditingId(null) },
                    )
                  }
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate font-display text-lg font-semibold text-foreground">
                      {locality.name}
                    </h3>
                    <ActiveBadge active={locality.active} />
                    <span className="rounded-full bg-accent/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent-foreground">
                      {formatLei(locality.deliveryPriceLei)}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`admin.locality.toggle.${index + 1}`}
                      onClick={() =>
                        updateLocality.mutate({
                          id: locality.id,
                          input: {
                            name: locality.name,
                            deliveryPriceLei: locality.deliveryPriceLei,
                            active: !locality.active,
                          },
                        })
                      }
                      className="rounded-full"
                    >
                      {locality.active ? "Dezactivează" : "Activează"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`admin.locality.edit_button.${index + 1}`}
                      onClick={() => setEditingId(String(locality.id))}
                      className="rounded-full"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Editează
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-ocid={`admin.locality.delete_button.${index + 1}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Ștergi localitatea „${locality.name}”?`,
                          )
                        ) {
                          deleteLocality.mutate(locality.id);
                        }
                      }}
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Șterge
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

/* --------------------------------- orders --------------------------------- */

const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  [OrderStatusEnum.noua]: {
    label: "Nouă",
    className: "bg-accent/25 text-accent-foreground",
  },
  [OrderStatusEnum.confirmata]: {
    label: "Confirmată",
    className: "bg-chart-4/20 text-foreground",
  },
  [OrderStatusEnum.inLivrare]: {
    label: "În livrare",
    className: "bg-warning/25 text-warning-foreground",
  },
  [OrderStatusEnum.livrata]: {
    label: "Livrată",
    className: "bg-success/15 text-success",
  },
  [OrderStatusEnum.anulata]: {
    label: "Anulată",
    className: "bg-destructive/15 text-destructive",
  },
};

const statusOrder: OrderStatus[] = [
  OrderStatusEnum.noua,
  OrderStatusEnum.confirmata,
  OrderStatusEnum.inLivrare,
  OrderStatusEnum.livrata,
  OrderStatusEnum.anulata,
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const setStatus = useSetOrderStatus();
  const resend = useResendTelegramNotification();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <li
      data-ocid={`admin.orders.item.${index + 1}`}
      className={cn(cardClass, "p-5")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              #{order.orderNumber}
            </span>
            <StatusBadge status={order.status} />
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                order.telegramSent
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Send className="size-3" aria-hidden="true" />
              {order.telegramSent ? "Trimis pe Telegram" : "Netrimis"}
            </span>
          </div>
          <p className="mt-2 font-display text-lg font-semibold text-foreground">
            {order.customerName}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.phone} · {order.localityName}, {order.address}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="font-mono text-xl font-bold text-foreground">
            {formatLei(order.totalLei)}
          </p>
          <p className="text-xs text-muted-foreground">
            produse {formatLei(order.itemsTotalLei)} + livrare{" "}
            {formatLei(order.deliveryPriceLei)}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 rounded-xl bg-muted/50 p-3">
        {order.lines.map((line) => (
          <li
            key={`${order.id}-${line.productId}`}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="min-w-0 truncate text-foreground">
              <span className="font-mono text-muted-foreground">
                {formatQuantity(line.quantity)}×
              </span>{" "}
              {line.productName}
              <span className="text-muted-foreground"> · {line.shopName}</span>
            </span>
            <span className="shrink-0 font-mono text-foreground">
              {formatLei(line.unitPriceLei * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-3 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Notă: </span>
          {order.notes}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={`order-status-${order.id}`}
            className="text-xs font-semibold text-foreground"
          >
            Status
          </Label>
          <select
            id={`order-status-${order.id}`}
            data-ocid={`admin.order.status_select.${index + 1}`}
            value={order.status}
            disabled={setStatus.isPending}
            onChange={(e) =>
              setStatus.mutate({
                id: order.id,
                status: e.target.value as OrderStatus,
              })
            }
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
          >
            {statusOrder.map((status) => (
              <option key={status} value={status}>
                {statusMeta[status].label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {feedback && (
            <span className="text-xs font-medium text-muted-foreground">
              {feedback}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid={`admin.order.resend_button.${index + 1}`}
            disabled={resend.isPending}
            onClick={() => {
              setFeedback(null);
              resend.mutate(order.id, {
                onSuccess: (result) =>
                  setFeedback(
                    result.__kind__ === "ok"
                      ? "Notificare retrimisă."
                      : `Eroare: ${result.err}`,
                  ),
                onError: () => setFeedback("Retrimiterea a eșuat."),
              });
            }}
            className="rounded-full"
          >
            {resend.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="size-4" aria-hidden="true" />
            )}
            Retrimite pe Telegram
          </Button>
        </div>
      </div>
    </li>
  );
}

function OrdersSection() {
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | "toate">("toate");

  const visible =
    orders?.filter((o) => filter === "toate" || o.status === filter) ?? [];

  return (
    <SectionShell
      id="orders"
      icon={<Package className="size-5" aria-hidden="true" />}
      title="Comenzi"
      description="Vezi detaliile comenzilor, schimbă statusul și retrimite notificarea."
    >
      <div
        data-ocid="admin.orders.filter.tab"
        className="mb-4 flex flex-wrap gap-2"
      >
        {(["toate", ...statusOrder] as const).map((value) => {
          const label = value === "toate" ? "Toate" : statusMeta[value].label;
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              data-ocid={`admin.orders.filter.${value}`}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" aria-hidden="true" />}
          title="Nicio comandă încă"
          description="Comenzile plasate de clienți vor apărea aici."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<X className="size-6" aria-hidden="true" />}
          title="Nicio comandă cu acest status"
          description="Schimbă filtrul pentru a vedea alte comenzi."
        />
      ) : (
        <ul data-ocid="admin.orders.list" className="space-y-4">
          {visible.map((order, index) => (
            <OrderCard key={String(order.id)} order={order} index={index} />
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

/* ---------------------------------- page ---------------------------------- */

function AccessDenied() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 md:px-6 md:py-24">
      <EmptyState
        icon={<X className="size-6" aria-hidden="true" />}
        title="Nu ai acces la panoul de administrare"
        description="Această zonă este rezervată administratorului. Autentifică-te cu contul de administrator pentru a continua."
        action={
          <SignInButton className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
        }
      />
    </div>
  );
}

function AdminDashboard() {
  const { data: isAdmin, isLoading, isError, refetch } = useIsAdmin();
  const { data: shops } = useAllShops();

  if (isLoading) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6"
      >
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-5 w-96" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 md:px-6">
        <ErrorState
          title="Nu am putut verifica accesul"
          description="Reîncarcă pagina sau autentifică-te din nou."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <PageHeader
        eyebrow="Administrare"
        title="Panoul administratorului"
        description="Gestionează magazinele, produsele, livrarea pe localități și comenzile primite."
      />

      <nav
        aria-label="Secțiuni administrare"
        className="mt-6 flex flex-wrap gap-2"
      >
        {[
          { href: "#shops", label: "Magazine" },
          { href: "#products", label: "Produse" },
          { href: "#localities", label: "Localități" },
          { href: "#orders", label: "Comenzi" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            data-ocid={`admin.nav.${item.href.slice(1)}_link`}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        <ShopsSection />
        <ProductsSection shops={shops ?? []} />
        <LocalitiesSection />
        <OrdersSection />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireSignIn
      fallback={
        <div className="mx-auto w-full max-w-2xl px-4 py-16 md:px-6 md:py-24">
          <EmptyState
            icon={<Store className="size-6" aria-hidden="true" />}
            title="Autentifică-te pentru administrare"
            description="Panoul de administrare este disponibil doar după autentificare cu Internet Identity."
            action={
              <SignInButton className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
            }
          />
        </div>
      }
    >
      <AdminDashboard />
    </RequireSignIn>
  );
}
