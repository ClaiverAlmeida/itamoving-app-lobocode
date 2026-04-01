import type { Caixa, ProductPrice } from "../../../api";

export function renumerarCaixas(lista: Caixa[]) {
  return lista.map((caixa) => ({
    ...caixa,
    number: "",
  }));
}

export function novoIdItem() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function caixaTemTodosCamposPreenchidos(c: Caixa) {
  const tipoValido = Boolean(String(c.type ?? "").trim());
  const valorValido = Number.isFinite(Number(c.value)) && Number(c.value) > 0;
  const pesoValido = Number.isFinite(Number(c.weight)) && Number(c.weight) > 0;
  return tipoValido && valorValido && pesoValido;
}

export function obterTipoProdutoDaCaixa(caixa: Caixa, opcoesCaixa: ProductPrice[]) {
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

