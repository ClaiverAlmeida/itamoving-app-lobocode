import type { DeliveryPriceForm } from "./delivery-prices.types";

export const DELIVERY_PRICE_FORM_INITIAL: DeliveryPriceForm = {
  originCity: "",
  originState: "",
  destinationCity: "",
  destinationState: "",
  pricePerKg: "",
  minimumPrice: "",
  deliveryDeadline: "",
  active: true,
};

