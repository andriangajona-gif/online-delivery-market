import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Orders "../types/orders";
import Telegram "../types/telegram";

module {
  public type Settings = { var botToken : Text; var chatId : Text };

  let maxResponseBytes : Nat64 = 100_000;

  func charToText(c : Char) : Text {
    Text.fromIter(Iter.singleton(c));
  };

  func escapeJson(value : Text) : Text {
    var out = "";
    for (c in value.chars()) {
      switch (c) {
        case ('\"') { out := out # "\\\"" };
        case ('\\') { out := out # "\\\\" };
        case ('\n') { out := out # "\\n" };
        case ('\r') { out := out # "\\r" };
        case ('\t') { out := out # "\\t" };
        case (_) { out := out # charToText(c) };
      };
    };
    out;
  };

  func formatLei(amount : Nat) : Text {
    amount.toText() # " lei";
  };

  func buildOrderText(order : Orders.Order) : Text {
    var text = "Comandă nouă " # order.orderNumber # "\n";
    text := text # "Client: " # order.customerName # "\n";
    text := text # "Telefon: " # order.phone # "\n";
    text := text # "Localitate: " # order.localityName # "\n";
    text := text # "Adresă: " # order.address # "\n";
    if (order.notes.size() > 0) {
      text := text # "Observații: " # order.notes # "\n";
    };
    text := text # "\nProduse:\n";

    // Group lines by shop, preserving first-seen order.
    var shopOrder : [Text] = [];
    for (line in order.lines.values()) {
      if (not shopOrder.contains(line.shopName)) {
        shopOrder := shopOrder.concat([line.shopName]);
      };
    };
    for (shop in shopOrder.values()) {
      text := text # "• " # shop # "\n";
      for (line in order.lines.values()) {
        if (line.shopName == shop) {
          text := text # "  - " # line.productName # " x" # line.quantity.toText()
            # " (" # formatLei(line.unitPriceLei) # "/buc) = "
            # formatLei(line.unitPriceLei * line.quantity) # "\n";
        };
      };
    };

    text := text # "\nSubtotal produse: " # formatLei(order.itemsTotalLei) # "\n";
    text := text # "Livrare: " # formatLei(order.deliveryPriceLei) # "\n";
    text := text # "Total: " # formatLei(order.totalLei);
    text;
  };

  func sendMessage(settings : Settings, text : Text, transform : OutCall.Transform) : async Telegram.TelegramTestResult {
    if (settings.botToken.size() == 0 or settings.chatId.size() == 0) {
      return #err("Setările Telegram nu sunt configurate.");
    };
    let url = "https://api.telegram.org/bot" # settings.botToken # "/sendMessage";
    let body = "{\"chat_id\":\"" # escapeJson(settings.chatId)
      # "\",\"text\":\"" # escapeJson(text) # "\"}";
    try {
      let response = await OutCall.httpRequest({
        url;
        method = #post;
        headers = [{ name = "Content-Type"; value = "application/json" }];
        body = ?(body.encodeUtf8());
        maxResponseBytes;
        transform;
      });
      let responseText = response.body.decodeUtf8() ?? "";
      if (response.status >= 200 and response.status < 300) {
        #ok;
      } else {
        #err("Telegram a răspuns cu status " # response.status.toText() # ": " # responseText);
      };
    } catch (e) {
      #err("Trimiterea către Telegram a eșuat: " # e.message());
    };
  };

  public func sendOrderMessage(settings : Settings, order : Orders.Order, transform : OutCall.Transform) : async Telegram.TelegramTestResult {
    await sendMessage(settings, buildOrderText(order), transform);
  };

  public func sendTestMessage(settings : Settings, transform : OutCall.Transform) : async Telegram.TelegramTestResult {
    await sendMessage(settings, "Mesaj de test de la magazinul online. Setările Telegram funcționează.", transform);
  };
};
