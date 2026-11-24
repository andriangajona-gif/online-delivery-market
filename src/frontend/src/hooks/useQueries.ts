import {
  type Id,
  type Locality,
  type LocalityInput,
  type Order,
  type OrderStatus,
  type PlaceOrderInput,
  type Product,
  type ProductInput,
  type Result,
  type Shop,
  type ShopInput,
  type TelegramSettings,
  type TelegramSettingsView,
  type TelegramTestResult,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const keys = {
  activeShops: ["shops", "active"] as const,
  allShops: ["shops", "all"] as const,
  activeProducts: (shopId: string) => ["products", "active", shopId] as const,
  allProducts: (shopId: string) => ["products", "all", shopId] as const,
  activeLocalities: ["localities", "active"] as const,
  allLocalities: ["localities", "all"] as const,
  orders: ["orders"] as const,
  telegram: ["telegram", "settings"] as const,
  isAdmin: ["auth", "isAdmin"] as const,
};

/* ------------------------------- public reads ------------------------------ */

export function useActiveShops() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Shop[]>({
    queryKey: keys.activeShops,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveProducts(shopId: Id | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: keys.activeProducts(String(shopId ?? "")),
    queryFn: async () => {
      if (!actor || shopId === undefined) return [];
      return actor.listActiveProducts(shopId);
    },
    enabled: !!actor && !isFetching && shopId !== undefined,
  });
}

export function useActiveLocalities() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Locality[]>({
    queryKey: keys.activeLocalities,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveLocalities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  return useMutation<Result, Error, PlaceOrderInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Magazinul nu este încă pregătit.");
      return actor.placeOrder(input);
    },
  });
}

/* --------------------------------- admin ---------------------------------- */

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: keys.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAllShops() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Shop[]>({
    queryKey: keys.allShops,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProducts(shopId: Id | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: keys.allProducts(String(shopId ?? "")),
    queryFn: async () => {
      if (!actor || shopId === undefined) return [];
      return actor.listAllProducts(shopId);
    },
    enabled: !!actor && !isFetching && shopId !== undefined,
  });
}

export function useAllLocalities() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Locality[]>({
    queryKey: keys.allLocalities,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllLocalities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: keys.orders,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTelegramSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TelegramSettingsView>({
    queryKey: keys.telegram,
    queryFn: async () => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.getTelegramSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

function useCatalogInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["shops"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["localities"] });
  };
}

export function useCreateShop() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<Shop, Error, ShopInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.createShop(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateShop() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<Shop | null, Error, { id: Id; input: ShopInput }>({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.updateShop(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteShop() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<boolean, Error, Id>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.deleteShop(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<Product, Error, ProductInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.createProduct(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<Product | null, Error, { id: Id; input: ProductInput }>({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.updateProduct(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<boolean, Error, Id>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useCreateLocality() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<Locality, Error, LocalityInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.createLocality(input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateLocality() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<Locality | null, Error, { id: Id; input: LocalityInput }>({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.updateLocality(id, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteLocality() {
  const { actor } = useActor(createActor);
  const invalidate = useCatalogInvalidation();
  return useMutation<boolean, Error, Id>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.deleteLocality(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useSetOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Order | null, Error, { id: Id; status: OrderStatus }>({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.setOrderStatus(id, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.orders });
    },
  });
}

export function useResendTelegramNotification() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<TelegramTestResult, Error, Id>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.resendTelegramNotification(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.orders });
    },
  });
}

export function useSaveTelegramSettings() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<TelegramSettingsView, Error, TelegramSettings>({
    mutationFn: async (settings) => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.saveTelegramSettings(settings);
    },
    onSuccess: (view) => {
      queryClient.setQueryData(keys.telegram, view);
    },
  });
}

export function useTestTelegramSettings() {
  const { actor } = useActor(createActor);
  return useMutation<TelegramTestResult, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backendul nu este pregătit.");
      return actor.testTelegramSettings();
    },
  });
}
