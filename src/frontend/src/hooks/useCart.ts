import { type CartLine, useCartStore } from "@/lib/cart-store";
import { useMemo } from "react";

export interface CartSummary {
  lines: CartLine[];
  itemCount: number;
  itemsTotalLei: bigint;
  shopCount: number;
}

export function useCart() {
  const lines = useCartStore((state) => state.lines);
  const addLine = useCartStore((state) => state.addLine);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeLine = useCartStore((state) => state.removeLine);
  const clear = useCartStore((state) => state.clear);

  const summary = useMemo<CartSummary>(() => {
    const itemsTotalLei = lines.reduce(
      (total, line) =>
        total + BigInt(line.unitPriceLei) * BigInt(line.quantity),
      0n,
    );
    return {
      lines,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      itemsTotalLei,
      shopCount: new Set(lines.map((line) => line.shopId)).size,
    };
  }, [lines]);

  return {
    ...summary,
    addLine,
    setQuantity,
    increment,
    decrement,
    removeLine,
    clear,
  };
}
