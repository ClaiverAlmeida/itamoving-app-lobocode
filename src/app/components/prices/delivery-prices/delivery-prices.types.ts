import type { PrecoEntrega } from "../../../api";

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
  setPrecosEntrega: (precos: PrecoEntrega[]) => void;
  deletePrecoEntrega: (id: string) => void;
  className?: string;
};

