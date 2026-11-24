import Common "common";

module {
  public type OrderStatus = {
    #noua;
    #confirmata;
    #inLivrare;
    #livrata;
    #anulata;
  };

  public type OrderLine = {
    productId : Common.Id;
    productName : Text;
    shopName : Text;
    unitPriceLei : Nat;
    quantity : Nat;
  };

  public type Order = {
    id : Common.Id;
    orderNumber : Text;
    customerName : Text;
    phone : Text;
    localityId : Common.Id;
    localityName : Text;
    address : Text;
    notes : Text;
    lines : [OrderLine];
    itemsTotalLei : Nat;
    deliveryPriceLei : Nat;
    totalLei : Nat;
    status : OrderStatus;
    createdAt : Common.Timestamp;
    telegramSent : Bool;
  };

  public type OrderLineInput = {
    productId : Common.Id;
    quantity : Nat;
  };

  public type PlaceOrderInput = {
    customerName : Text;
    phone : Text;
    localityId : Common.Id;
    address : Text;
    notes : Text;
    lines : [OrderLineInput];
  };

  public type PlaceOrderError = {
    #emptyCart;
    #unknownProduct : Common.Id;
    #unknownLocality : Common.Id;
    #invalidQuantity;
    #invalidInput : Text;
    #telegramNotConfigured;
  };
};
