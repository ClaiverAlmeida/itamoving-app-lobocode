import type { Caixa, DeliveryPrice, ProductPrice } from "../../../api";

export function renumerarCaixas(lista: Caixa[]) {
  return lista.map((caixa) => ({
    ...caixa,
    number: "",
  }));
}

export function novoIdItem() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function isLinhaEntrega(c: Caixa): boolean {
  return c.lineKind === "delivery";
}

export function caixaTemTodosCamposPreenchidos(c: Caixa) {
  if (isLinhaEntrega(c)) {
    const rota =
      Boolean(String(c.deliveryPriceId ?? "").trim()) || Boolean(String(c.type ?? "").trim());
    const valorValido = Number.isFinite(Number(c.value)) && Number(c.value) > 0;
    return rota && valorValido;
  }
  const tipoValido = Boolean(String(c.type ?? "").trim());
  const valorValido = Number.isFinite(Number(c.value)) && Number(c.value) > 0;
  const pesoValido = Number.isFinite(Number(c.weight)) && Number(c.weight) > 0;
  return tipoValido && valorValido && pesoValido;
}

export function obterTipoProdutoDaCaixa(caixa: Caixa, opcoesCaixa: ProductPrice[]) {
  if (caixa.lineKind === "delivery" && caixa.productId) {
    return opcoesCaixa.find((p) => p.id === caixa.productId)?.type;
  }
  const produtoDaCaixa = opcoesCaixa.find(
    (p) =>
      p.type === caixa.type ||
      p.name === caixa.type ||
      p.size === caixa.type ||
      (p.dimensions != null && p.dimensions === caixa.type),
  );
  return produtoDaCaixa?.type;
}

export function isFitaAdesiva(caixa: Caixa, opcoesCaixa: ProductPrice[]) {
  return obterTipoProdutoDaCaixa(caixa, opcoesCaixa) === "TAPE_ADHESIVE";
}

export function isCaixaPersonalizada(caixa: Caixa, opcoesCaixa: ProductPrice[]) {
  return obterTipoProdutoDaCaixa(caixa, opcoesCaixa) === "PERSONALIZED_ITEM";
}

/** Itens obrigatórios quando o preço de entrega referencia um produto de volume (exc. fita e personalizado). */
export function entregaExigeItens(
  caixa: Caixa,
  precosEntrega: DeliveryPrice[],
  opcoesCaixa: ProductPrice[],
): boolean {
  if (!isLinhaEntrega(caixa)) return false;
  const eid = String(caixa.deliveryPriceId ?? caixa.type ?? "").trim();
  const ent = precosEntrega.find((e) => e.id === eid);
  if (!ent?.productId) return false;
  const prod = opcoesCaixa.find((p) => p.id === ent.productId);
  if (!prod) return false;
  if (prod.type === "TAPE_ADHESIVE" || prod.type === "PERSONALIZED_ITEM") return false;
  return true;
}

