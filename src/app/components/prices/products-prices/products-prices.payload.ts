import type { CreateProductPriceDTO, PrecoProduto, UpdateProductPriceDTO } from "../../../api";
import type { ProductPriceForm } from "./products-prices.types";

function isBoxType(type: ProductPriceForm["type"]) {
  return type === "SMALL_BOX" || type === "MEDIUM_BOX" || type === "LARGE_BOX" || type === "PERSONALIZED_ITEM";
}

function isTapeType(type: ProductPriceForm["type"]) {
  return type === "TAPE_ADHESIVE";
}

export function buildCreateProductPayload(form: ProductPriceForm): CreateProductPriceDTO {
  const isBox = isBoxType(form.type);
  const isTape = isTapeType(form.type);

  const dimensions = isTape
    ? null
    : isBox && form.dimensions
      ? form.dimensions
      : undefined;

  const maxWeight = isTape
    ? null
    : isBox && form.maxWeight
      ? parseFloat(form.maxWeight)
      : undefined;

  const payload: CreateProductPriceDTO = {
    type: form.type,
    name: form.name,
    costPrice: parseFloat(form.costPrice),
    salePrice: parseFloat(form.salePrice),
    active: form.active,
    variablePrice: form.variablePrice,
  };

  if (dimensions !== undefined) payload.dimensions = dimensions;
  if (maxWeight !== undefined) payload.maxWeight = maxWeight;

  return payload;
}

export function buildUpdateProductPatch(params: { form: ProductPriceForm; original: PrecoProduto }): UpdateProductPriceDTO {
  const { form, original } = params;
  const isBox = isBoxType(form.type);
  const isTape = isTapeType(form.type);

  const current: CreateProductPriceDTO = {
    type: form.type,
    name: form.name,
    dimensions: isTape ? null : isBox ? form.dimensions || undefined : undefined,
    maxWeight: isTape ? null : isBox ? (form.maxWeight ? parseFloat(form.maxWeight) : undefined) : undefined,
    costPrice: parseFloat(form.costPrice),
    salePrice: parseFloat(form.salePrice),
    active: form.active,
    variablePrice: form.variablePrice,
  };

  const patch: UpdateProductPriceDTO = {};

  if (current.type !== original.type) patch.type = current.type;
  if (current.name !== original.name) patch.name = current.name;

  if (isTape) {
    const needsClear =
      original.type !== "TAPE_ADHESIVE" || original.dimensions != null || original.maxWeight != null;
    if (needsClear) {
      patch.dimensions = null;
      patch.maxWeight = null;
    }
  } else if (isBox) {
    const dimChanged = (current.dimensions ?? "") !== (original.dimensions ?? "");
    const weightChanged = (current.maxWeight ?? null) !== (original.maxWeight ?? null);

    if (dimChanged) {
      if (current.dimensions !== undefined && current.dimensions !== "") patch.dimensions = current.dimensions;
      else if (original.dimensions != null && original.dimensions !== "") patch.dimensions = null;
    }

    if (weightChanged) {
      if (current.maxWeight !== undefined && current.maxWeight !== null) patch.maxWeight = current.maxWeight;
      else if (original.maxWeight != null) patch.maxWeight = null;
    }
  }

  if (current.costPrice !== original.costPrice) patch.costPrice = current.costPrice;
  if (current.salePrice !== original.salePrice) patch.salePrice = current.salePrice;
  if (current.active !== original.active) patch.active = current.active;
  if (current.variablePrice !== original.variablePrice) patch.variablePrice = current.variablePrice;

  return patch;
}

