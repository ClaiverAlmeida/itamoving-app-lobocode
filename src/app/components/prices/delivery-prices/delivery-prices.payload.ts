import type { CreateDeliveryPriceDTO, DeliveryPrice, UpdateDeliveryPriceEntregaDTO } from "../../../api";
import type { DeliveryPriceForm } from "./delivery-prices.types";
import { parseIntInputToNumber, parseMoneyInputToNumber } from "./delivery-prices.utils";

export function buildCreateDeliveryPayload(form: DeliveryPriceForm): CreateDeliveryPriceDTO {
  const productId = normalizeProductId(form.productId);
  return {
    routeName: form.routeName,
    totalPrice: parseMoneyInputToNumber(form.totalPrice),
    deliveryDeadline: parseIntInputToNumber(form.deliveryDeadline),
    /** Sem produto: omite a chave no POST (evita `disconnect` inválido no create do Prisma). */
    ...(productId != null ? { productId } : {}),
    active: form.active,
    isVariablePrice: form.isVariablePrice,
  };
}

function normalizeProductId(id: string | undefined | null): string | undefined {
  if (id == null) return undefined;
  const t = String(id).trim();
  return t.length > 0 ? t : undefined;
}

function normalizeRouteName(s: string | undefined | null): string {
  return String(s ?? "").trim();
}

type ComparableDelivery = {
  routeName: string;
  totalPrice: number;
  deliveryDeadline: number;
  productId: string | undefined;
  active: boolean;
  isVariablePrice: boolean;
};

function comparableFromOriginal(original: DeliveryPrice): ComparableDelivery {
  const total = Number(original.totalPrice);
  const deadline = Number(original.deliveryDeadline);
  return {
    routeName: normalizeRouteName(original.routeName),
    totalPrice: Number.isFinite(total) ? total : NaN,
    deliveryDeadline: Number.isFinite(deadline) ? Math.trunc(deadline) : parseIntInputToNumber(String(original.deliveryDeadline ?? "")),
    productId: normalizeProductId(original.productId),
    active: Boolean(original.active),
    isVariablePrice: Boolean(original.isVariablePrice),
  };
}

function comparableFromForm(form: DeliveryPriceForm): ComparableDelivery {
  return {
    routeName: normalizeRouteName(form.routeName),
    totalPrice: parseMoneyInputToNumber(form.totalPrice),
    deliveryDeadline: parseIntInputToNumber(form.deliveryDeadline),
    productId: normalizeProductId(form.productId),
    active: Boolean(form.active),
    isVariablePrice: Boolean(form.isVariablePrice),
  };
}

function pricesDiffer(a: number, b: number): boolean {
  if (!Number.isFinite(a) && !Number.isFinite(b)) return false;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return true;
  return Math.abs(a - b) > 1e-9;
}

export function buildUpdateDeliveryPatch(params: {
  form: DeliveryPriceForm;
  original: DeliveryPrice;
}): UpdateDeliveryPriceEntregaDTO {
  const { form, original } = params;

  const currentDto = buildCreateDeliveryPayload(form);
  const o = comparableFromOriginal(original);
  const c = comparableFromForm(form);

  const patch: UpdateDeliveryPriceEntregaDTO = {};

  if (c.routeName !== o.routeName) patch.routeName = currentDto.routeName;
  if (pricesDiffer(c.totalPrice, o.totalPrice)) patch.totalPrice = currentDto.totalPrice;
  if (c.deliveryDeadline !== o.deliveryDeadline) patch.deliveryDeadline = currentDto.deliveryDeadline;
  /** `null` serializa no JSON e o repositório aplica `disconnect` no relacionamento. */
  if (c.productId !== o.productId) patch.productId = c.productId ?? null;
  if (c.active !== o.active) patch.active = currentDto.active;
  if (c.isVariablePrice !== o.isVariablePrice) patch.isVariablePrice = currentDto.isVariablePrice;

  return patch;
}
