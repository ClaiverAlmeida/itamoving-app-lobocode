import type { CreateDeliveryPriceDTO, PrecoEntrega, UpdateDeliveryPriceEntregaDTO } from "../../../api";
import type { DeliveryPriceForm } from "./delivery-prices.types";
import { parseIntInputToNumber, parseMoneyInputToNumber } from "./delivery-prices.utils";

export function buildCreateDeliveryPayload(form: DeliveryPriceForm): CreateDeliveryPriceDTO {
  return {
    originCity: form.originCity,
    originState: form.originState,
    destinationCity: form.destinationCity,
    destinationState: form.destinationState,
    pricePerKg: parseMoneyInputToNumber(form.pricePerKg),
    minimumPrice: parseMoneyInputToNumber(form.minimumPrice),
    deliveryDeadline: parseIntInputToNumber(form.deliveryDeadline),
    active: form.active,
  };
}

export function buildUpdateDeliveryPatch(params: {
  form: DeliveryPriceForm;
  original: PrecoEntrega;
}): UpdateDeliveryPriceEntregaDTO {
  const { form, original } = params;

  const current: CreateDeliveryPriceDTO = {
    originCity: form.originCity,
    originState: form.originState,
    destinationCity: form.destinationCity,
    destinationState: form.destinationState,
    pricePerKg: parseMoneyInputToNumber(form.pricePerKg),
    minimumPrice: parseMoneyInputToNumber(form.minimumPrice),
    deliveryDeadline: parseIntInputToNumber(form.deliveryDeadline),
    active: form.active,
  };

  const patch: UpdateDeliveryPriceEntregaDTO = {};

  if (current.originCity !== original.originCity) patch.originCity = current.originCity;
  if (current.originState !== original.originState) patch.originState = current.originState;
  if (current.destinationCity !== original.destinationCity) patch.destinationCity = current.destinationCity;
  if (current.destinationState !== original.destinationState) patch.destinationState = current.destinationState;
  if (current.pricePerKg !== original.pricePerKg) patch.pricePerKg = current.pricePerKg;
  if (current.minimumPrice !== original.minimumPrice) patch.minimumPrice = current.minimumPrice;
  if (current.deliveryDeadline !== original.deliveryDeadline) patch.deliveryDeadline = current.deliveryDeadline;
  if (current.active !== original.active) patch.active = current.active;

  return patch;
}

