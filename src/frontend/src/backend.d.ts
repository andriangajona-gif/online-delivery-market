import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface HttpHeader {
    value: string;
    name: string;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export type Id = bigint;
export interface Locality {
    id: Id;
    active: boolean;
    name: string;
    deliveryPriceLei: bigint;
}
export interface LocalityInput {
    active: boolean;
    name: string;
    deliveryPriceLei: bigint;
}
export interface Order {
    id: Id;
    customerName: string;
    status: OrderStatus;
    itemsTotalLei: bigint;
    telegramSent: boolean;
    createdAt: Timestamp;
    localityName: string;
    localityId: Id;
    deliveryPriceLei: bigint;
    lines: Array<OrderLine>;
    totalLei: bigint;
    address: string;
    notes: string;
    phone: string;
    orderNumber: string;
}
export interface OrderLine {
    productId: Id;
    productName: string;
    unitPriceLei: bigint;
    shopName: string;
    quantity: bigint;
}
export interface OrderLineInput {
    productId: Id;
    quantity: bigint;
}
export type PlaceOrderError = {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "unknownProduct";
    unknownProduct: Id;
} | {
    __kind__: "telegramNotConfigured";
    telegramNotConfigured: null;
} | {
    __kind__: "unknownLocality";
    unknownLocality: Id;
} | {
    __kind__: "invalidQuantity";
    invalidQuantity: null;
} | {
    __kind__: "emptyCart";
    emptyCart: null;
};
export interface PlaceOrderInput {
    customerName: string;
    localityId: Id;
    lines: Array<OrderLineInput>;
    address: string;
    notes: string;
    phone: string;
}
export interface Product {
    id: Id;
    active: boolean;
    shopId: Id;
    name: string;
    unit: string;
    description: string;
    priceLei: bigint;
}
export interface ProductInput {
    active: boolean;
    shopId: Id;
    name: string;
    unit: string;
    description: string;
    priceLei: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: PlaceOrderError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Shop {
    id: Id;
    active: boolean;
    sortOrder: bigint;
    name: string;
    description: string;
}
export interface ShopInput {
    active: boolean;
    sortOrder: bigint;
    name: string;
    description: string;
}
export interface TelegramSettings {
    chatId: string;
    botToken: string;
}
export interface TelegramSettingsView {
    configured: boolean;
    chatId: string;
    botToken: string;
}
export type TelegramTestResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export type Timestamp = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: HttpRequestResult;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum OrderStatus {
    noua = "noua",
    anulata = "anulata",
    inLivrare = "inLivrare",
    livrata = "livrata",
    confirmata = "confirmata"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createLocality(input: LocalityInput): Promise<Locality>;
    createProduct(input: ProductInput): Promise<Product>;
    createShop(input: ShopInput): Promise<Shop>;
    deleteLocality(id: Id): Promise<boolean>;
    deleteProduct(id: Id): Promise<boolean>;
    deleteShop(id: Id): Promise<boolean>;
    execute(qJson: string): Promise<Result__1>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(id: Id): Promise<Order | null>;
    getTelegramSettings(): Promise<TelegramSettingsView>;
    isCallerAdmin(): Promise<boolean>;
    listActiveLocalities(): Promise<Array<Locality>>;
    listActiveProducts(shopId: Id): Promise<Array<Product>>;
    listActiveShops(): Promise<Array<Shop>>;
    listAllLocalities(): Promise<Array<Locality>>;
    listAllProducts(shopId: Id): Promise<Array<Product>>;
    listAllShops(): Promise<Array<Shop>>;
    listOrders(): Promise<Array<Order>>;
    placeOrder(input: PlaceOrderInput): Promise<Result>;
    resendTelegramNotification(id: Id): Promise<TelegramTestResult>;
    saveTelegramSettings(settings: TelegramSettings): Promise<TelegramSettingsView>;
    schema(): Promise<string>;
    setOrderStatus(id: Id, status: OrderStatus): Promise<Order | null>;
    testTelegramSettings(): Promise<TelegramTestResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateLocality(id: Id, input: LocalityInput): Promise<Locality | null>;
    updateProduct(id: Id, input: ProductInput): Promise<Product | null>;
    updateShop(id: Id, input: ShopInput): Promise<Shop | null>;
    upsertLocalities(inputs: Array<LocalityInput>): Promise<Array<Locality>>;
}
