# Project Guidance

## User Preferences

- Interfața în limba română
- Prețuri afișate în lei
- Comenzile sosesc pe Telegram, nu pe email

## Accepted Requirements

- Comandă online din mai multe magazine (Linella, Bravo, Dacidan, Farmacie)
- Livrare la domiciliu cu preț diferit pe fiecare sat/localitate
- Comanda ajunge pe Telegram cu adresa, satul/orașul, telefonul și produsele dorite
- Administratorul își încarcă lista de prețuri pe localități
- Magazinul Bravo cu Pizza la 110 lei și Coca-Cola 0,5 L la 13 lei, comandabile ca orice alt magazin

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend Id is bigint; cart lines keep productId, shopId and unitPriceLei as strings in src/frontend/src/lib/cart-store.ts and convert with BigInt() at the backend boundary.
- TanStack useParams({ from: '/magazin/$shopId' }) types shopId as string; convert with BigInt() for backend Id arguments.
- Include Expose only once in src/backend/main.mo: two Expose includes redeclare schema/execute and fail; compose entity lists into one include.
- An Order with a [OrderLine] field and a status variant needs OQL toEntityManual with .payload projections, not toEntity.
- OutCall.Transform must be threaded as a mixin parameter; src/backend/main.mo declares the public query transform and passes it to the orders mixin.
- A fresh-install migration must use OldActor = {} when the deployed .baseline is an empty actor; initialize component state via its initState().
- OrderStatus is a value enum from @/backend; import it as a value for status maps and select options, not as a type.
- useIsAdmin returns false for signed-out callers; gate admin pages on the Internet Identity identity first, then isAdmin, to distinguish sign-in from access-denied.
- The 00000000_000000.mo migration is frozen (already applied); seed catalog data idempotently from src/backend/main.mo at actor start instead of editing it.
- Seed shops, products and localities idempotently by trimmed lowercase name via the existing create* functions so the id counters stay the single id source and admin edits are never overwritten.
- The order page uses a native select for the delivery locality; a Radix Select failed to open in automation.
- The admin ProductForm hardcodes active: true on submit, so editing a product reactivates a deactivated one; the separate toggle handles availability.
