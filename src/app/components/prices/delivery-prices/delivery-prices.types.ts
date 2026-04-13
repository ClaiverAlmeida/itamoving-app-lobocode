import type { DeliveryPrice } from "../../../api";

export type DeliveryPriceForm = {
  productId: string;
  minimumPrice: string;
  deliveryDeadline: string;
  active: boolean;
};

export type DeliveryPricesTabProps = {
  setPrecosEntrega: (precos: DeliveryPrice[]) => void;
  deleteDeliveryPrice: (id: string) => void;
  className?: string;
};

