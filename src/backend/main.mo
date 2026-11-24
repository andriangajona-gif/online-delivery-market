import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Expose "mo:caffeineai-oql/Expose";
import CatalogLib "lib/catalog";
import OrdersLib "lib/orders";
import CatalogApiMixin "mixins/catalog-api";
import CatalogOql "mixins/catalog";
import OrdersApiMixin "mixins/orders-api";
import OrdersOql "mixins/orders";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let catalogState : CatalogLib.State;
  let ordersState : OrdersLib.State;

  // Seed the Bravo shop and its two products. Idempotent by name, so it runs
  // safely on every start and never duplicates or overwrites admin edits.
  CatalogLib.seedBravo(catalogState);

  // Seed a small set of Romanian delivery localities so the order page offers
  // real choices. Idempotent by name, so it never duplicates or overwrites
  // localities the administrator has created or edited.
  CatalogLib.seedLocalities(catalogState);

  // HTTP outcall response transform — required by the Telegram notification
  // outcalls in the orders domain.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  include CatalogApiMixin(accessControlState, catalogState);
  include OrdersApiMixin(accessControlState, catalogState, ordersState, transform);

  // OQL exposure: catalog entities (public) and orders (controller-only),
  // composed into the single Expose include that provides schema()/execute().
  include Expose({
    entities = CatalogOql.entities(catalogState).concat(OrdersOql.entities(ordersState));
  });

  include ApiDocMixin();
};
