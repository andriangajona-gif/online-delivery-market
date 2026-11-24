/** Prices are stored as whole lei (bigint). Render them with Romanian grouping. */
export function formatLei(value: bigint | number): string {
  const amount = typeof value === "bigint" ? Number(value) : value;
  return `${new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(amount)} lei`;
}

/** Motoko Time.now() values are nanosecond bigints. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatQuantity(quantity: bigint): string {
  return new Intl.NumberFormat("ro-RO").format(Number(quantity));
}
