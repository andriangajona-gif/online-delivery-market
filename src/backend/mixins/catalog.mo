import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import CatalogLib "../lib/catalog";

// Builds the OQL entity declarations for the catalog collections so the Data
// Intelligence agent and the user's own AI assistant can query shops, products
// and delivery localities. The catalog is public browsing data, so every entity
// is public. The caller composes these into the single `Expose` include.
module {
  public func entities(catalogState : CatalogLib.State) : [Entity.Decl] {
    [
      catalogState.shops.toEntity("shop", "Shop", "id")
        .sample({ id = 0; name = ""; description = ""; active = true; sortOrder = 0 })
        .public_()
        .build(),
      catalogState.products.toEntity("product", "Product", "id")
        .sample({ id = 0; shopId = 0; name = ""; description = ""; priceLei = 0; unit = ""; active = true })
        .edge("shopId", "shop")
        .public_()
        .build(),
      catalogState.localities.toEntity("locality", "Locality", "id")
        .sample({ id = 0; name = ""; deliveryPriceLei = 0; active = true })
        .public_()
        .build(),
    ];
  };
};
