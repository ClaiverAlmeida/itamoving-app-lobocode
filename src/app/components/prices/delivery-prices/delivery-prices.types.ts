import type { DeliveryPrice } from "../../../api";

export type DeliveryPriceForm = {
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pricePerKg: string;
  minimumPrice: string;
  deliveryDeadline: string;
  active: boolean;
};

export type DeliveryPricesTabProps = {
  setPrecosEntrega: (precos: DeliveryPrice[]) => void;
  deleteDeliveryPrice: (id: string) => void;
  className?: string;
};

