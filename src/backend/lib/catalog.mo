import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Char "mo:core/Char";
import Common "../types/common";
import Catalog "../types/catalog";

module {
  public type State = {
    shops : Map.Map<Common.Id, Catalog.Shop>;
    products : Map.Map<Common.Id, Catalog.Product>;
    localities : Map.Map<Common.Id, Catalog.Locality>;
    var nextShopId : Nat;
    var nextProductId : Nat;
    var nextLocalityId : Nat;
  };

  // ---- Shops ----

  public func listActiveShops(state : State) : [Catalog.Shop] {
    state.shops.values().filter(func shop = shop.active).toArray();
  };

  public func listAllShops(state : State) : [Catalog.Shop] {
    state.shops.values().toArray();
  };

  public func createShop(state : State, input : Catalog.ShopInput) : Catalog.Shop {
    let id = state.nextShopId;
    state.nextShopId := id + 1;
    let shop : Catalog.Shop = {
      id;
      name = input.name;
      description = input.description;
      active = input.active;
      sortOrder = input.sortOrder;
    };
    state.shops.add(id, shop);
    shop;
  };

  public func updateShop(state : State, id : Common.Id, input : Catalog.ShopInput) : ?Catalog.Shop {
    switch (state.shops.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Catalog.Shop = {
          id = existing.id;
          name = input.name;
          description = input.description;
          active = input.active;
          sortOrder = input.sortOrder;
        };
        state.shops.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteShop(state : State, id : Common.Id) : Bool {
    if (not state.shops.containsKey(id)) {
      return false;
    };
    state.shops.remove(id);
    // Cascade: remove the shop's products so no orphan rows remain.
    let snapshot = state.products.toArray();
    for ((productId, product) in snapshot.values()) {
      if (product.shopId == id) {
        state.products.remove(productId);
      };
    };
    true;
  };

  // ---- Products ----

  public func listActiveProducts(state : State, shopId : Common.Id) : [Catalog.Product] {
    state.products.values().filter(func product = product.shopId == shopId and product.active).toArray();
  };

  public func listAllProducts(state : State, shopId : Common.Id) : [Catalog.Product] {
    state.products.values().filter(func product = product.shopId == shopId).toArray();
  };

  public func createProduct(state : State, input : Catalog.ProductInput) : Catalog.Product {
    let id = state.nextProductId;
    state.nextProductId := id + 1;
    let product : Catalog.Product = {
      id;
      shopId = input.shopId;
      name = input.name;
      description = input.description;
      priceLei = input.priceLei;
      unit = input.unit;
      active = input.active;
    };
    state.products.add(id, product);
    product;
  };

  public func updateProduct(state : State, id : Common.Id, input : Catalog.ProductInput) : ?Catalog.Product {
    switch (state.products.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Catalog.Product = {
          id = existing.id;
          shopId = input.shopId;
          name = input.name;
          description = input.description;
          priceLei = input.priceLei;
          unit = input.unit;
          active = input.active;
        };
        state.products.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteProduct(state : State, id : Common.Id) : Bool {
    if (not state.products.containsKey(id)) {
      return false;
    };
    state.products.remove(id);
    true;
  };

  // ---- Localities ----

  public func listActiveLocalities(state : State) : [Catalog.Locality] {
    state.localities.values().filter(func locality = locality.active).toArray();
  };

  public func listAllLocalities(state : State) : [Catalog.Locality] {
    state.localities.values().toArray();
  };

  public func createLocality(state : State, input : Catalog.LocalityInput) : Catalog.Locality {
    let id = state.nextLocalityId;
    state.nextLocalityId := id + 1;
    let locality : Catalog.Locality = {
      id;
      name = input.name;
      deliveryPriceLei = input.deliveryPriceLei;
      active = input.active;
    };
    state.localities.add(id, locality);
    locality;
  };

  public func updateLocality(state : State, id : Common.Id, input : Catalog.LocalityInput) : ?Catalog.Locality {
    switch (state.localities.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Catalog.Locality = {
          id = existing.id;
          name = input.name;
          deliveryPriceLei = input.deliveryPriceLei;
          active = input.active;
        };
        state.localities.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteLocality(state : State, id : Common.Id) : Bool {
    if (not state.localities.containsKey(id)) {
      return false;
    };
    state.localities.remove(id);
    true;
  };

  // ---- Seed data ----

  // Ensures the Bravo shop and its two products exist. Idempotent: a shop or
  // product whose name already exists (case-insensitive, trimmed) is left
  // untouched, so re-running never duplicates or overwrites admin edits.
  public func seedBravo(state : State) {
    let shopName = "Bravo";
    let shopKey = shopName.trim(#predicate(Char.isWhitespace)).toLower();
    let existingShop = state.shops.values().find(
      func(shop) = shop.name.trim(#predicate(Char.isWhitespace)).toLower() == shopKey
    );
    let shopId = switch (existingShop) {
      case (?shop) { shop.id };
      case null {
        createShop(state, {
          name = shopName;
          description = "Magazin Bravo — pizza și băuturi răcoritoare.";
          active = true;
          sortOrder = 1;
        }).id;
      };
    };

    let seedProducts : [Catalog.ProductInput] = [
      {
        shopId;
        name = "Pizza";
        description = "Pizza Bravo, o bucată.";
        priceLei = 110;
        unit = "bucată";
        active = true;
      },
      {
        shopId;
        name = "Coca-Cola 0,5 L";
        description = "Coca-Cola, sticlă de 0,5 L.";
        priceLei = 13;
        unit = "sticlă 0,5 L";
        active = true;
      },
    ];

    for (input in seedProducts.values()) {
      let key = input.name.trim(#predicate(Char.isWhitespace)).toLower();
      let exists = state.products.values().any(
        func(product) = product.shopId == shopId and product.name.trim(#predicate(Char.isWhitespace)).toLower() == key
      );
      if (not exists) {
        ignore createProduct(state, input);
      };
    };
  };

  // Ensures a small set of Romanian delivery localities exists. Idempotent by
  // trimmed lowercase name: an existing locality (seeded or admin-created) is
  // left untouched, so re-running never duplicates or overwrites admin edits.
  public func seedLocalities(state : State) {
    let seedLocalities : [Catalog.LocalityInput] = [
      { name = "Bălți"; deliveryPriceLei = 15; active = true },
      { name = "Orhei"; deliveryPriceLei = 20; active = true },
      { name = "Cahul"; deliveryPriceLei = 30; active = true },
      { name = "Soroca"; deliveryPriceLei = 25; active = true },
      { name = "Ungheni"; deliveryPriceLei = 18; active = true },
      { name = "Hîncești"; deliveryPriceLei = 22; active = true },
    ];

    for (input in seedLocalities.values()) {
      let key = input.name.trim(#predicate(Char.isWhitespace)).toLower();
      let exists = state.localities.values().any(
        func(locality) = locality.name.trim(#predicate(Char.isWhitespace)).toLower() == key
      );
      if (not exists) {
        ignore createLocality(state, input);
      };
    };
  };

  // ---- Bulk delivery price list ----

  // Adds many localities in one call. A locality whose name already exists
  // (case-insensitive, trimmed) is updated in place instead of duplicated, so
  // re-submitting the same list is safe. Returns the resulting records.
  public func upsertLocalities(state : State, inputs : [Catalog.LocalityInput]) : [Catalog.Locality] {
    let results = inputs.map(
      func(input) {
        let key = input.name.trim(#predicate(Char.isWhitespace)).toLower();
        let existing = state.localities.values().find(
          func(locality) = locality.name.trim(#predicate(Char.isWhitespace)).toLower() == key
        );
        switch (existing) {
          case (?locality) {
            let updated : Catalog.Locality = {
              id = locality.id;
              name = input.name;
              deliveryPriceLei = input.deliveryPriceLei;
              active = input.active;
            };
            state.localities.add(locality.id, updated);
            updated;
          };
          case null {
            createLocality(state, input);
          };
        };
      }
    );
    results;
  };
};
