import type { CreateDeliveryPriceDTO, DeliveryPrice, UpdateDeliveryPriceEntregaDTO } from "../../../api";
import type { DeliveryPriceForm } from "./delivery-prices.types";
import { parseIntInputToNumber, parseMoneyInputToNumber } from "./delivery-prices.utils";

export function buildCreateDeliveryPayload(form: DeliveryPriceForm): CreateDeliveryPriceDTO {
  return {
    productId: form.productId,
    minimumPrice: parseMoneyInputToNumber(form.minimumPrice),
    deliveryDeadline: parseIntInputToNumber(form.deliveryDeadline),
    active: form.active,
  };
}

export function buildUpdateDeliveryPatch(params: {
  form: DeliveryPriceForm;
  original: DeliveryPrice;
}): UpdateDeliveryPriceEntregaDTO {
  const { form, original } = params;

  const current: CreateDeliveryPriceDTO = {
    productId: form.productId,
    minimumPrice: parseMoneyInputToNumber(form.minimumPrice),
    deliveryDeadline: parseIntInputToNumber(form.deliveryDeadline),
    active: form.active,
  };

  const patch: UpdateDeliveryPriceEntregaDTO = {};
  if (current.productId !== original.productId) patch.productId = current.productId;
  if (current.minimumPrice !== original.minimumPrice) patch.minimumPrice = current.minimumPrice;
  if (current.deliveryDeadline !== original.deliveryDeadline) patch.deliveryDeadline = current.deliveryDeadline;
  if (current.active !== original.active) patch.active = current.active;

  return patch;
}

