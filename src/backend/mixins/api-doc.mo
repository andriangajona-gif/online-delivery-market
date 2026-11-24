mixin () {
  public query func getApiDoc() : async Text {
    "# Backend API — Comenzi online multi-magazin\n" #
    "\n" #
    "This canister powers a Romanian multi-shop grocery ordering app. Visitors browse a catalog of shops (Linella, Bravo, Dacidan, Farmacie), products and delivery localities, then place an order that is delivered to the administrator's Telegram chat. Prices are integer lei (Romanian currency).\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "- **Public methods** (no sign-in required): `listActiveShops`, `listActiveProducts`, `listActiveLocalities`, `placeOrder`.\n" #
    "- **Admin methods** require a signed-in caller holding the `#admin` role. Anonymous callers and signed-in non-admins receive the trap `Unauthorized: Only admins can perform this action`.\n" #
    "- The app's frontend pins an Internet Identity derivation origin, published at `/.well-known/ii-derivation-origin` when available. An agent already holding the user's Internet Identity authorization derives the correct per-app principal against that origin (for example `icp identity link web <name> --app <host>`). Such a delegation acts with the user's full authority in this app until it expires.\n" #
    "- **Registration prerequisite:** the first caller to invoke `_initialize_access_control` becomes the admin; every later caller becomes a regular user. A principal that never signed in through the app's own frontend is unregistered even when it belongs to the app's owner, and a principal derived against a different origin is a different principal than the one the frontend registered. Call `_initialize_access_control` once as a signed-in caller before any admin-guarded call, including guarded queries.\n" #
    "\n" #
    "## Units and encoding\n" #
    "\n" #
    "- All prices (`priceLei`, `deliveryPriceLei`, `itemsTotalLei`, `totalLei`, `unitPriceLei`) are `nat` in whole lei.\n" #
    "- `createdAt` is `int` nanoseconds since the Unix epoch (IC `Time.now()`).\n" #
    "- `id` fields are `nat` counters. `orderNumber` is a human-readable string of the form `CMD-0001`.\n" #
    "- `status` is a variant: `#noua`, `#confirmata`, `#inLivrare`, `#livrata`, `#anulata`.\n" #
    "\n" #
    "## Catalog (public reads)\n" #
    "\n" #
    "- `listActiveShops() : [Shop]` — active shops only.\n" #
    "- `listActiveProducts(shopId) : [Product]` — active products of one shop.\n" #
    "- `listActiveLocalities() : [Locality]` — active delivery localities with their delivery price.\n" #
    "\n" #
    "### Seeded Bravo shop\n" #
    "\n" #
    "The catalog is seeded automatically on canister start with one active shop, **Bravo** (\"Magazin Bravo — pizza și băuturi răcoritoare.\", sort order 1), and exactly two active products belonging to it: **Pizza** at 110 lei per `bucată`, and **Coca-Cola 0,5 L** at 13 lei per `sticlă 0,5 L`. Seeding is idempotent by name (case-insensitive, trimmed): it never creates duplicates and never overwrites or deletes shops, products or localities the administrator has created or edited. The administrator can still edit the Bravo shop and its products through the admin endpoints below.\n" #
    "\n" #
    "### Seeded delivery localities\n" #
    "\n" #
    "On canister start the catalog is also seeded with a small set of active Romanian delivery localities, each with a whole-lei delivery price: **Bălți** (15 lei), **Orhei** (20 lei), **Cahul** (30 lei), **Soroca** (25 lei), **Ungheni** (18 lei) and **Hîncești** (22 lei). These appear in `listActiveLocalities` so a customer can pick one when placing an order. The seed is idempotent by trimmed lowercase name: a locality that already exists (seeded or administrator-created) is left untouched, so re-running never duplicates and never overwrites or deletes administrator edits. The administrator can still edit or delete these localities through the admin endpoints below.\n" #
    "\n" #
    "## Catalog (admin)\n" #
    "\n" #
    "`listAllShops`, `listAllProducts(shopId)`, `listAllLocalities` return every record including inactive ones. Mutations: `createShop`, `updateShop`, `deleteShop`, `createProduct`, `updateProduct`, `deleteProduct`, `createLocality`, `updateLocality`, `deleteLocality`. Deleting a shop cascades to delete its products. `upsertLocalities(inputs)` adds many localities at once; a locality whose name already exists (case-insensitive, trimmed) is updated in place, so re-submitting the same list is idempotent.\n" #
    "\n" #
    "## Orders\n" #
    "\n" #
    "- `placeOrder(input) : Result<Text, PlaceOrderError>` — public. Validates name, phone, address, non-empty cart, known locality and products. On success it stores the order, attempts a Telegram notification, and returns the `orderNumber`. The Telegram send is best-effort: a failure does not fail the order, and `telegramSent` records whether it succeeded. Retrying `placeOrder` creates a **new** order each time — it is not idempotent.\n" #
    "- `listOrders() : [Order]` — admin, newest first.\n" #
    "- `getOrder(id) : ?Order` — admin.\n" #
    "- `setOrderStatus(id, status) : ?Order` — admin; returns `null` when the order does not exist.\n" #
    "- `resendTelegramNotification(id)` — admin; re-sends the order to Telegram and updates `telegramSent`.\n" #
    "\n" #
    "`PlaceOrderError` variants: `#emptyCart`, `#unknownProduct(id)`, `#unknownLocality(id)`, `#invalidQuantity`, `#invalidInput(text)`, `#telegramNotConfigured`.\n" #
    "\n" #
    "## Telegram settings (admin)\n" #
    "\n" #
    "- `getTelegramSettings() : TelegramSettingsView` — returns `botToken`, `chatId`, `configured`.\n" #
    "- `saveTelegramSettings(settings)` — stores trimmed token and chat id.\n" #
    "- `testTelegramSettings() : TelegramTestResult` — sends a test message; returns `#ok` or `#err(text)`.\n" #
    "\n" #
    "## OQL\n" #
    "\n" #
    "`schema()` and `execute()` expose shops, products, localities (public) and orders (controller-only) for natural-language querying. Orders are controller-only because they contain customer contact details. The seeded Bravo shop, its two products and the seeded delivery localities appear in the `shop`, `product` and `locality` tables.\n" #
    "\n" #
    "## Gotchas\n" #
    "\n" #
    "- Admin-guarded queries trap for non-admins rather than returning empty data.\n" #
    "- `placeOrder` is not idempotent; duplicate submissions create duplicate orders.\n" #
    "- Telegram delivery depends on valid bot token and chat id; check `configured` before relying on notifications.\n" #
    "- The Bravo shop and its two products are seeded automatically and are not re-created if the administrator renames or deletes them; seeding only adds a missing shop/product by name.\n" #
    "- The delivery localities are seeded automatically on start and are not re-created if the administrator renames or deletes them; seeding only adds a missing locality by trimmed lowercase name."
  };
};
