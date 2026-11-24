import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import Catalog "../types/catalog";
import CatalogLib "../lib/catalog";
import Orders "../types/orders";
import Telegram "../types/telegram";
import TelegramLib "../lib/telegram";
import OutCall "mo:caffeineai-http-outcalls/outcall";

module {
  public type State = {
    orders : Map.Map<Common.Id, Orders.Order>;
    var nextOrderId : Nat;
    telegram : { var botToken : Text; var chatId : Text };
  };

  func isSpace(c : Char) : Bool {
    c == ' ' or c == '\t' or c == '\n' or c == '\r';
  };

  func clean(value : Text) : Text {
    value.trim(#predicate(isSpace));
  };

  func isBlank(value : Text) : Bool {
    clean(value).size() == 0;
  };

  func pad4(raw : Text) : Text {
    if (raw.size() >= 4) {
      raw;
    } else {
      var prefix = "";
      var i = raw.size();
      while (i < 4) {
        prefix := prefix # "0";
        i += 1;
      };
      prefix # raw;
    };
  };

  func formatOrderNumber(id : Common.Id) : Text {
    "CMD-" # pad4(id.toText());
  };

  func buildOrder(
    state : State,
    catalog : CatalogLib.State,
    input : Orders.PlaceOrderInput,
  ) : { #ok : Orders.Order; #err : Orders.PlaceOrderError } {
    if (isBlank(input.customerName)) {
      return #err(#invalidInput("Numele clientului este obligatoriu."));
    };
    if (isBlank(input.phone)) {
      return #err(#invalidInput("Telefonul este obligatoriu."));
    };
    if (isBlank(input.address)) {
      return #err(#invalidInput("Adresa este obligatorie."));
    };
    if (input.lines.size() == 0) {
      return #err(#emptyCart);
    };

    let locality = switch (catalog.localities.get(input.localityId)) {
      case (?l) { l };
      case null { return #err(#unknownLocality(input.localityId)) };
    };

    var itemsTotal = 0;
    var lines : [Orders.OrderLine] = [];
    for (lineInput in input.lines.values()) {
      if (lineInput.quantity == 0) {
        return #err(#invalidQuantity);
      };
      let product = switch (catalog.products.get(lineInput.productId)) {
        case (?p) { p };
        case null { return #err(#unknownProduct(lineInput.productId)) };
      };
      let shopName = switch (catalog.shops.get(product.shopId)) {
        case (?s) { s.name };
        case null { "" };
      };
      itemsTotal += product.priceLei * lineInput.quantity;
      lines := lines.concat([{
        productId = product.id;
        productName = product.name;
        shopName;
        unitPriceLei = product.priceLei;
        quantity = lineInput.quantity;
      }]);
    };

    let id = state.nextOrderId;
    state.nextOrderId := id + 1;

    let order : Orders.Order = {
      id;
      orderNumber = formatOrderNumber(id);
      customerName = clean(input.customerName);
      phone = clean(input.phone);
      localityId = locality.id;
      localityName = locality.name;
      address = clean(input.address);
      notes = input.notes;
      lines;
      itemsTotalLei = itemsTotal;
      deliveryPriceLei = locality.deliveryPriceLei;
      totalLei = itemsTotal + locality.deliveryPriceLei;
      status = #noua;
      createdAt = Time.now();
      telegramSent = false;
    };

    #ok(order);
  };

  public func placeOrder(
    state : State,
    catalog : CatalogLib.State,
    input : Orders.PlaceOrderInput,
  ) : { #ok : Orders.Order; #err : Orders.PlaceOrderError } {
    switch (buildOrder(state, catalog, input)) {
      case (#err(e)) { #err(e) };
      case (#ok(order)) {
        state.orders.add(order.id, order);
        #ok(order);
      };
    };
  };

  public func listOrders(state : State) : [Orders.Order] {
    let all = state.orders.values().toArray();
    all.sort(func (a, b) = Nat.compare(b.id, a.id));
  };

  public func getOrder(state : State, id : Common.Id) : ?Orders.Order {
    state.orders.get(id);
  };

  public func setOrderStatus(state : State, id : Common.Id, status : Orders.OrderStatus) : ?Orders.Order {
    switch (state.orders.get(id)) {
      case (?order) {
        let updated : Orders.Order = { order with status };
        state.orders.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func resendTelegramNotification(state : State, id : Common.Id, transform : OutCall.Transform) : async Telegram.TelegramTestResult {
    switch (state.orders.get(id)) {
      case (?order) {
        let result = await TelegramLib.sendOrderMessage(state.telegram, order, transform);
        switch (result) {
          case (#ok) {
            state.orders.add(id, { order with telegramSent = true });
            #ok;
          };
          case (#err(e)) {
            state.orders.add(id, { order with telegramSent = false });
            #err(e);
          };
        };
      };
      case null { #err("Comanda nu a fost găsită.") };
    };
  };

  public func getTelegramSettings(state : State) : Telegram.TelegramSettingsView {
    {
      botToken = state.telegram.botToken;
      chatId = state.telegram.chatId;
      configured = state.telegram.botToken.size() > 0 and state.telegram.chatId.size() > 0;
    };
  };

  public func saveTelegramSettings(state : State, settings : Telegram.TelegramSettings) : Telegram.TelegramSettingsView {
    state.telegram.botToken := clean(settings.botToken);
    state.telegram.chatId := clean(settings.chatId);
    getTelegramSettings(state);
  };

  public func testTelegramSettings(state : State, transform : OutCall.Transform) : async Telegram.TelegramTestResult {
    await TelegramLib.sendTestMessage(state.telegram, transform);
  };
};
