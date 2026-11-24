import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import IntValue "mo:caffeineai-oql/IntValue";
import OrdersLib "../lib/orders";

// Builds the OQL entity declaration for the orders collection so the Data
// Intelligence agent (running as the controller) can answer questions about
// incoming orders. Orders contain customer contact details, so the entity is
// controller-only: no end user or their AI assistant reads another customer's
// order. The caller composes this into the single `Expose` include.
//
// Manual mode: `Order` carries a `lines : [OrderLine]` collection field and a
// `status` variant, neither of which auto-derives. Each is projected to a
// scalar column (line count, status tag) so the row stays flat and queryable.
module {
  public func entities(ordersState : OrdersLib.State) : [Entity.Decl] {
    [
      ordersState.orders.toEntityManual("order", "Order", "id")
        .sample({
          id = 0;
          orderNumber = "";
          customerName = "";
          phone = "";
          localityId = 0;
          localityName = "";
          address = "";
          notes = "";
          lines = [];
          itemsTotalLei = 0;
          deliveryPriceLei = 0;
          totalLei = 0;
          status = #noua;
          createdAt = 0;
          telegramSent = false;
        })
        .payload("orderNumber", func o = o.orderNumber)
        .payload("customerName", func o = o.customerName)
        .payload("phone", func o = o.phone)
        .payload("localityId", func o = o.localityId)
        .payload("localityName", func o = o.localityName)
        .payload("address", func o = o.address)
        .payload("notes", func o = o.notes)
        .payload("lineCount", func o = o.lines.size())
        .payload("itemsTotalLei", func o = o.itemsTotalLei)
        .payload("deliveryPriceLei", func o = o.deliveryPriceLei)
        .payload("totalLei", func o = o.totalLei)
        .payload("status", func o = switch (o.status) {
          case (#noua) "noua";
          case (#confirmata) "confirmata";
          case (#inLivrare) "inLivrare";
          case (#livrata) "livrata";
          case (#anulata) "anulata";
        })
        .payload("createdAt", func o = o.createdAt)
        .payload("telegramSent", func o = o.telegramSent)
        .controllerOnly()
        .build(),
    ];
  };
};
