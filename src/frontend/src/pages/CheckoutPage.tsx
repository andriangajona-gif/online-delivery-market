import type { Locality, PlaceOrderError, PlaceOrderInput } from "@/backend";
import { EmptyState, PageHeader } from "@/components/layout/PageParts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useActiveLocalities, usePlaceOrder } from "@/hooks/useQueries";
import type { CartLine } from "@/lib/cart-store";
import { formatLei } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBasket,
  Store,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ShopGroup {
  shopId: string;
  shopName: string;
  lines: CartLine[];
  subtotalLei: bigint;
}

interface Confirmation {
  orderNumber: string;
  customerName: string;
  phone: string;
  localityName: string;
  address: string;
  notes: string;
  itemsTotalLei: bigint;
  deliveryPriceLei: bigint;
  totalLei: bigint;
  lines: CartLine[];
}

interface FormErrors {
  customerName?: string;
  phone?: string;
  localityId?: string;
  address?: string;
}

const PHONE_PATTERN = /^[+0-9][0-9\s().-]{5,}$/;

function groupByShop(lines: CartLine[]): ShopGroup[] {
  const groups = new Map<string, ShopGroup>();
  for (const line of lines) {
    const existing = groups.get(line.shopId);
    if (existing) {
      existing.lines.push(line);
      existing.subtotalLei += BigInt(line.unitPriceLei) * BigInt(line.quantity);
    } else {
      groups.set(line.shopId, {
        shopId: line.shopId,
        shopName: line.shopName,
        lines: [line],
        subtotalLei: BigInt(line.unitPriceLei) * BigInt(line.quantity),
      });
    }
  }
  return Array.from(groups.values());
}

function describePlaceOrderError(error: PlaceOrderError): string {
  switch (error.__kind__) {
    case "invalidInput":
      return error.invalidInput.trim().length > 0
        ? error.invalidInput
        : "Datele comenzii nu sunt valide. Verifică câmpurile și încearcă din nou.";
    case "unknownProduct":
      return "Un produs din coș nu mai este disponibil. Elimină-l și încearcă din nou.";
    case "unknownLocality":
      return "Localitatea aleasă nu mai este disponibilă pentru livrare. Alege alta.";
    case "invalidQuantity":
      return "Cantitatea unui produs nu este validă. Verifică coșul.";
    case "emptyCart":
      return "Coșul este gol. Adaugă produse înainte de a trimite comanda.";
    case "telegramNotConfigured":
      return "Comenzile nu pot fi trimise momentan. Sună magazinul pentru a comanda.";
    default:
      return "Comanda nu a putut fi trimisă. Încearcă din nou.";
  }
}

export default function CheckoutPage() {
  const { lines, itemCount, itemsTotalLei, increment, decrement, removeLine } =
    useCart();
  const { data: localities, isLoading: localitiesLoading } =
    useActiveLocalities();
  const placeOrder = usePlaceOrder();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const groups = useMemo(() => groupByShop(lines), [lines]);

  const selectedLocality: Locality | undefined = useMemo(
    () => (localities ?? []).find((item) => String(item.id) === localityId),
    [localities, localityId],
  );

  const deliveryPriceLei = selectedLocality?.deliveryPriceLei ?? 0n;
  const totalLei = itemsTotalLei + deliveryPriceLei;

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (customerName.trim().length < 2) {
      next.customerName = "Scrie numele complet pentru livrare.";
    }
    if (!PHONE_PATTERN.test(phone.trim())) {
      next.phone = "Scrie un număr de telefon valid, de exemplu 069 123 456.";
    }
    if (!localityId) {
      next.localityId = "Alege localitatea în care livrăm.";
    }
    if (address.trim().length < 5) {
      next.address = "Scrie adresa detaliată: stradă, număr, repere.";
    }
    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (lines.length === 0) {
      setSubmitError("Coșul este gol. Adaugă produse înainte de a trimite.");
      return;
    }
    if (!selectedLocality) {
      setErrors({ localityId: "Alege localitatea în care livrăm." });
      return;
    }

    const input: PlaceOrderInput = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      localityId: selectedLocality.id,
      address: address.trim(),
      notes: notes.trim(),
      lines: lines.map((line) => ({
        productId: BigInt(line.productId),
        quantity: BigInt(line.quantity),
      })),
    };

    const snapshot: Confirmation = {
      orderNumber: "",
      customerName: input.customerName,
      phone: input.phone,
      localityName: selectedLocality.name,
      address: input.address,
      notes: input.notes,
      itemsTotalLei,
      deliveryPriceLei,
      totalLei,
      lines: lines.map((line) => ({ ...line })),
    };

    placeOrder.mutate(input, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          setConfirmation({ ...snapshot, orderNumber: result.ok });
        } else {
          setSubmitError(describePlaceOrderError(result.err));
        }
      },
      onError: () => {
        setSubmitError(
          "Comanda nu a putut fi trimisă. Verifică conexiunea și încearcă din nou.",
        );
      },
    });
  }

  if (confirmation) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <div
          data-ocid="checkout.success_state"
          className="rounded-2xl border border-success/30 bg-card p-6 shadow-card md:p-8"
        >
          <span className="grid size-14 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
            Comanda a fost trimisă!
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Îți mulțumim, {confirmation.customerName}. Te contactăm la{" "}
            {confirmation.phone} pentru confirmarea livrării.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              Număr comandă
            </span>
            <span className="font-mono text-base font-semibold text-foreground">
              {confirmation.orderNumber}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Livrare
              </h2>
              <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <dt>Localitate</dt>
                  <dd className="text-right text-foreground">
                    {confirmation.localityName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Adresă</dt>
                  <dd className="text-right text-foreground">
                    {confirmation.address}
                  </dd>
                </div>
                {confirmation.notes && (
                  <div className="flex justify-between gap-4">
                    <dt>Observații</dt>
                    <dd className="text-right text-foreground">
                      {confirmation.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Produse comandate
              </h2>
              <ul className="mt-2 divide-y divide-border">
                {confirmation.lines.map((line) => (
                  <li
                    key={line.productId}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {line.productName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {line.shopName} · {line.quantity} ×{" "}
                        {formatLei(BigInt(line.unitPriceLei))}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-foreground">
                      {formatLei(
                        BigInt(line.unitPriceLei) * BigInt(line.quantity),
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Produse</dt>
                  <dd className="font-mono text-foreground">
                    {formatLei(confirmation.itemsTotalLei)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livrare</dt>
                  <dd className="font-mono text-foreground">
                    {formatLei(confirmation.deliveryPriceLei)}
                  </dd>
                </div>
                <div className="flex justify-between pt-1 text-base font-semibold">
                  <dt className="text-foreground">Total</dt>
                  <dd className="font-mono text-primary">
                    {formatLei(confirmation.totalLei)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <Button asChild className="mt-6 rounded-full">
            <Link to="/" data-ocid="checkout.back_home_link">
              Înapoi la magazine
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <PageHeader
          eyebrow="Coșul tău"
          title="Finalizează comanda"
          description="Completează datele de livrare și trimite comanda."
        />
        <div className="mt-8">
          <EmptyState
            icon={<ShoppingBasket className="size-6" aria-hidden="true" />}
            title="Coșul este gol"
            description="Adaugă produse din magazinele satului, apoi revino aici pentru a finaliza comanda."
            action={
              <Button asChild className="rounded-full">
                <Link to="/" data-ocid="checkout.empty_state_link">
                  Vezi magazinele
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <PageHeader
        eyebrow="Coșul tău"
        title="Finalizează comanda"
        description="Verifică produsele, completează datele de livrare și trimite comanda."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section
          data-ocid="checkout.cart_panel"
          aria-label="Produsele din coș"
          className="space-y-4"
        >
          {groups.map((group) => (
            <div
              key={group.shopId}
              data-ocid="checkout.shop_group"
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <Store className="size-4" aria-hidden="true" />
                  </span>
                  <h2 className="truncate font-display text-lg font-semibold text-foreground">
                    {group.shopName}
                  </h2>
                </div>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {formatLei(group.subtotalLei)}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-border">
                {group.lines.map((line) => (
                  <li
                    key={line.productId}
                    data-ocid="checkout.cart_line"
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {line.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatLei(BigInt(line.unitPriceLei))} / {line.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Scade cantitatea pentru ${line.productName}`}
                        data-ocid="checkout.decrement_button"
                        onClick={() => decrement(line.productId)}
                        className="size-8 rounded-full"
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </Button>
                      <span
                        aria-live="polite"
                        className="w-8 text-center font-mono text-sm text-foreground"
                      >
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Crește cantitatea pentru ${line.productName}`}
                        data-ocid="checkout.increment_button"
                        onClick={() => increment(line.productId)}
                        className="size-8 rounded-full"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <span className="w-24 shrink-0 text-right font-mono text-sm font-semibold text-foreground">
                      {formatLei(
                        BigInt(line.unitPriceLei) * BigInt(line.quantity),
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Elimină ${line.productName} din coș`}
                      data-ocid="checkout.remove_button"
                      onClick={() => removeLine(line.productId)}
                      className="size-8 rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <form
          onSubmit={handleSubmit}
          noValidate
          data-ocid="checkout.form"
          className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card md:p-6 lg:sticky lg:top-24"
        >
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Date de livrare
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Comanda ajunge direct la magazin.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkout-name">Nume și prenume</Label>
            <Input
              id="checkout-name"
              data-ocid="checkout.name_input"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Ion Popescu"
              autoComplete="name"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={
                errors.customerName ? "checkout-name-error" : undefined
              }
            />
            {errors.customerName && (
              <p
                id="checkout-name-error"
                data-ocid="checkout.name_error"
                className="text-sm text-destructive"
              >
                {errors.customerName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkout-phone">Telefon</Label>
            <Input
              id="checkout-phone"
              data-ocid="checkout.phone_input"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="069 123 456"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? "checkout-phone-error" : undefined
              }
            />
            {errors.phone && (
              <p
                id="checkout-phone-error"
                data-ocid="checkout.phone_error"
                className="text-sm text-destructive"
              >
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkout-locality">Localitate</Label>
            <select
              id="checkout-locality"
              data-ocid="checkout.locality_select"
              value={localityId}
              onChange={(event) => setLocalityId(event.target.value)}
              aria-invalid={Boolean(errors.localityId)}
              aria-describedby={
                errors.localityId ? "checkout-locality-error" : undefined
              }
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20"
            >
              <option value="" disabled>
                {localitiesLoading
                  ? "Se încarcă localitățile…"
                  : "Alege localitatea"}
              </option>
              {(localities ?? []).map((locality) => (
                <option key={String(locality.id)} value={String(locality.id)}>
                  {locality.name} · livrare{" "}
                  {formatLei(locality.deliveryPriceLei)}
                </option>
              ))}
            </select>
            {errors.localityId && (
              <p
                id="checkout-locality-error"
                data-ocid="checkout.locality_error"
                className="text-sm text-destructive"
              >
                {errors.localityId}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkout-address">Adresă detaliată</Label>
            <Input
              id="checkout-address"
              data-ocid="checkout.address_input"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Str. Principală 12, lângă primărie"
              autoComplete="street-address"
              aria-invalid={Boolean(errors.address)}
              aria-describedby={
                errors.address ? "checkout-address-error" : undefined
              }
            />
            {errors.address && (
              <p
                id="checkout-address-error"
                data-ocid="checkout.address_error"
                className="text-sm text-destructive"
              >
                {errors.address}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkout-notes">
              Observații{" "}
              <span className="font-normal text-muted-foreground">
                (opțional)
              </span>
            </Label>
            <Textarea
              id="checkout-notes"
              data-ocid="checkout.notes_textarea"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ex: sunați înainte de a ajunge"
              rows={2}
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Produse ({itemCount})
              </span>
              <span className="font-mono text-foreground">
                {formatLei(itemsTotalLei)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livrare</span>
              <span
                data-ocid="checkout.delivery_price"
                className="font-mono text-foreground"
              >
                {selectedLocality
                  ? formatLei(deliveryPriceLei)
                  : "Alege localitatea"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
              <span className="text-foreground">Total</span>
              <span
                data-ocid="checkout.total_price"
                className="font-mono text-primary"
              >
                {formatLei(totalLei)}
              </span>
            </div>
          </div>

          {submitError && (
            <p
              data-ocid="checkout.error_state"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            data-ocid="checkout.submit_button"
            disabled={placeOrder.isPending}
            className="h-11 w-full rounded-full text-base"
          >
            {placeOrder.isPending ? "Se trimite comanda…" : "Trimite comanda"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Badge
              variant="secondary"
              className="rounded-full bg-accent/20 text-accent-foreground"
            >
              Plata la livrare
            </Badge>
          </p>
        </form>
      </div>
    </div>
  );
}
