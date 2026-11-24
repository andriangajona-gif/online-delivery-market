import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A cart line keeps the display data it needs so the cart survives reloads. */
export interface CartLine {
  productId: string;
  shopId: string;
  shopName: string;
  productName: string;
  unit: string;
  unitPriceLei: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
}

const MAX_QUANTITY = 99;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (item) => item.productId === line.productId,
          );
          if (existing) {
            return {
              lines: state.lines.map((item) =>
                item.productId === line.productId
                  ? {
                      ...item,
                      quantity: Math.min(
                        MAX_QUANTITY,
                        item.quantity + quantity,
                      ),
                    }
                  : item,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              { ...line, quantity: Math.min(MAX_QUANTITY, quantity) },
            ],
          };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((item) => item.productId !== productId)
              : state.lines.map((item) =>
                  item.productId === productId
                    ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) }
                    : item,
                ),
        })),
      increment: (productId) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: Math.min(MAX_QUANTITY, item.quantity + 1),
                }
              : item,
          ),
        })),
      decrement: (productId) =>
        set((state) => ({
          lines: state.lines
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeLine: (productId) =>
        set((state) => ({
          lines: state.lines.filter((item) => item.productId !== productId),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "satul-meu-cart", version: 1 },
  ),
);
