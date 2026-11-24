import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CatalogLib "../lib/catalog";
import OrdersLib "../lib/orders";
import Orders "../types/orders";
import Telegram "../types/telegram";
import OutCall "mo:caffeineai-http-outcalls/outcall";

mixin (
  accessControlState : AccessControl.AccessControlState,
  catalogState : CatalogLib.State,
  ordersState : OrdersLib.State,
  transform : OutCall.Transform,
) {
  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // Public — any visitor can place an order.

  public shared func placeOrder(input : Orders.PlaceOrderInput) : async Result.Result<Text, Orders.PlaceOrderError> {
    switch (OrdersLib.placeOrder(ordersState, catalogState, input)) {
      case (#ok(order)) {
        let result = await OrdersLib.resendTelegramNotification(ordersState, order.id, transform);
        switch (result) {
          case (#ok) {};
          case (#err(_)) {};
        };
        #ok(order.orderNumber);
      };
      case (#err(e)) { #err(e) };
    };
  };

  // Administrator — orders and Telegram settings.

  public query ({ caller }) func listOrders() : async [Orders.Order] {
    requireAdmin(caller);
    OrdersLib.listOrders(ordersState);
  };

  public query ({ caller }) func getOrder(id : Common.Id) : async ?Orders.Order {
    requireAdmin(caller);
    OrdersLib.getOrder(ordersState, id);
  };

  public shared ({ caller }) func setOrderStatus(id : Common.Id, status : Orders.OrderStatus) : async ?Orders.Order {
    requireAdmin(caller);
    OrdersLib.setOrderStatus(ordersState, id, status);
  };

  public shared ({ caller }) func resendTelegramNotification(id : Common.Id) : async Telegram.TelegramTestResult {
    requireAdmin(caller);
    await OrdersLib.resendTelegramNotification(ordersState, id, transform);
  };

  public query ({ caller }) func getTelegramSettings() : async Telegram.TelegramSettingsView {
    requireAdmin(caller);
    OrdersLib.getTelegramSettings(ordersState);
  };

  public shared ({ caller }) func saveTelegramSettings(settings : Telegram.TelegramSettings) : async Telegram.TelegramSettingsView {
    requireAdmin(caller);
    OrdersLib.saveTelegramSettings(ordersState, settings);
  };

  public shared ({ caller }) func testTelegramSettings() : async Telegram.TelegramTestResult {
    requireAdmin(caller);
    await OrdersLib.testTelegramSettings(ordersState, transform);
  };
};
