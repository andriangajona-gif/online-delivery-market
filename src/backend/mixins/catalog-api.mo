import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Catalog "../types/catalog";
import CatalogLib "../lib/catalog";

mixin (
  accessControlState : AccessControl.AccessControlState,
  catalogState : CatalogLib.State,
) {
  func requireCatalogAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // Public browsing — any visitor, including anonymous.

  public query func listActiveShops() : async [Catalog.Shop] {
    CatalogLib.listActiveShops(catalogState);
  };

  public query func listActiveProducts(shopId : Common.Id) : async [Catalog.Product] {
    CatalogLib.listActiveProducts(catalogState, shopId);
  };

  public query func listActiveLocalities() : async [Catalog.Locality] {
    CatalogLib.listActiveLocalities(catalogState);
  };

  // Administrator management — admin role only.

  public query ({ caller }) func listAllShops() : async [Catalog.Shop] {
    requireCatalogAdmin(caller);
    CatalogLib.listAllShops(catalogState);
  };

  public query ({ caller }) func listAllProducts(shopId : Common.Id) : async [Catalog.Product] {
    requireCatalogAdmin(caller);
    CatalogLib.listAllProducts(catalogState, shopId);
  };

  public query ({ caller }) func listAllLocalities() : async [Catalog.Locality] {
    requireCatalogAdmin(caller);
    CatalogLib.listAllLocalities(catalogState);
  };

  public shared ({ caller }) func createShop(input : Catalog.ShopInput) : async Catalog.Shop {
    requireCatalogAdmin(caller);
    CatalogLib.createShop(catalogState, input);
  };

  public shared ({ caller }) func updateShop(id : Common.Id, input : Catalog.ShopInput) : async ?Catalog.Shop {
    requireCatalogAdmin(caller);
    CatalogLib.updateShop(catalogState, id, input);
  };

  public shared ({ caller }) func deleteShop(id : Common.Id) : async Bool {
    requireCatalogAdmin(caller);
    CatalogLib.deleteShop(catalogState, id);
  };

  public shared ({ caller }) func createProduct(input : Catalog.ProductInput) : async Catalog.Product {
    requireCatalogAdmin(caller);
    CatalogLib.createProduct(catalogState, input);
  };

  public shared ({ caller }) func updateProduct(id : Common.Id, input : Catalog.ProductInput) : async ?Catalog.Product {
    requireCatalogAdmin(caller);
    CatalogLib.updateProduct(catalogState, id, input);
  };

  public shared ({ caller }) func deleteProduct(id : Common.Id) : async Bool {
    requireCatalogAdmin(caller);
    CatalogLib.deleteProduct(catalogState, id);
  };

  public shared ({ caller }) func createLocality(input : Catalog.LocalityInput) : async Catalog.Locality {
    requireCatalogAdmin(caller);
    CatalogLib.createLocality(catalogState, input);
  };

  public shared ({ caller }) func updateLocality(id : Common.Id, input : Catalog.LocalityInput) : async ?Catalog.Locality {
    requireCatalogAdmin(caller);
    CatalogLib.updateLocality(catalogState, id, input);
  };

  public shared ({ caller }) func deleteLocality(id : Common.Id) : async Bool {
    requireCatalogAdmin(caller);
    CatalogLib.deleteLocality(catalogState, id);
  };

  // Bulk delivery price list — admin enters many villages and prices at once.

  public shared ({ caller }) func upsertLocalities(inputs : [Catalog.LocalityInput]) : async [Catalog.Locality] {
    requireCatalogAdmin(caller);
    CatalogLib.upsertLocalities(catalogState, inputs);
  };
};
