import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Shop = {
    id : Nat;
    name : Text;
    description : Text;
    active : Bool;
    sortOrder : Nat;
  };

  type Product = {
    id : Nat;
    shopId : Nat;
    name : Text;
    description : Text;
    priceLei : Nat;
    unit : Text;
    active : Bool;
  };

  type Locality = {
    id : Nat;
    name : Text;
    deliveryPriceLei : Nat;
    active : Bool;
  };

  type OrderLine = {
    productId : Nat;
    productName : Text;
    shopName : Text;
    unitPriceLei : Nat;
    quantity : Nat;
  };

  type OrderStatus = {
    #noua;
    #confirmata;
    #inLivrare;
    #livrata;
    #anulata;
  };

  type Order = {
    id : Nat;
    orderNumber : Text;
    customerName : Text;
    phone : Text;
    localityId : Nat;
    localityName : Text;
    address : Text;
    notes : Text;
    lines : [OrderLine];
    itemsTotalLei : Nat;
    deliveryPriceLei : Nat;
    totalLei : Nat;
    status : OrderStatus;
    createdAt : Int;
    telegramSent : Bool;
  };

  type CatalogState = {
    shops : Map.Map<Nat, Shop>;
    products : Map.Map<Nat, Product>;
    localities : Map.Map<Nat, Locality>;
    var nextShopId : Nat;
    var nextProductId : Nat;
    var nextLocalityId : Nat;
  };

  type OrdersState = {
    orders : Map.Map<Nat, Order>;
    var nextOrderId : Nat;
    telegram : { var botToken : Text; var chatId : Text };
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    catalogState : CatalogState;
    ordersState : OrdersState;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      catalogState = {
        shops = Map.empty();
        products = Map.empty();
        localities = Map.empty();
        var nextShopId = 0;
        var nextProductId = 0;
        var nextLocalityId = 0;
      };
      ordersState = {
        orders = Map.empty();
        var nextOrderId = 0;
        telegram = { var botToken = ""; var chatId = "" };
      };
    };
  };
};
