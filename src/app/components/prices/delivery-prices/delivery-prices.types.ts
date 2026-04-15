import type { DeliveryPrice } from "../../../api";

export type DeliveryPriceForm = {
  routeName: string;
  productId: string;
  totalPrice: string;
  deliveryDeadline: string;
  active: boolean;
  isVariablePrice: boolean;
};

export type DeliveryPricesTabProps = {
  setPrecosEntrega: (precos: DeliveryPrice[]) => void;
  deleteDeliveryPrice: (id: string) => void;
  className?: string;
};

