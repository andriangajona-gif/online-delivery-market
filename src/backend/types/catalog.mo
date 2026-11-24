import Common "common";

module {
  public type Shop = {
    id : Common.Id;
    name : Text;
    description : Text;
    active : Bool;
    sortOrder : Nat;
  };

  public type Product = {
    id : Common.Id;
    shopId : Common.Id;
    name : Text;
    description : Text;
    priceLei : Nat;
    unit : Text;
    active : Bool;
  };

  public type Locality = {
    id : Common.Id;
    name : Text;
    deliveryPriceLei : Nat;
    active : Bool;
  };

  public type ShopInput = {
    name : Text;
    description : Text;
    active : Bool;
    sortOrder : Nat;
  };

  public type ProductInput = {
    shopId : Common.Id;
    name : Text;
    description : Text;
    priceLei : Nat;
    unit : Text;
    active : Bool;
  };

  public type LocalityInput = {
    name : Text;
    deliveryPriceLei : Nat;
    active : Bool;
  };
};
