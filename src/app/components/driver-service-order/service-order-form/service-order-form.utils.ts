import React from "react";
import type { ProductPrice } from "../../../api";
export function valorSelectCaixa(p: ProductPrice): string {
  return p.size || p.name;
}

/** Valor do Select da caixa ao hidratar a OS a partir da API (productId + relação `product`). */
export function resolveCaixaSelectValueFromApiLine(
  p: {
    productId?: string;
    product?: { dimensions?: string | null; name?: string } | null;
  },
  produtos: ProductPrice[],
): string {
  if (p.productId) {
    const m = produtos.find((x) => x.id === p.productId);
    if (m) return valorSelectCaixa(m);
  }
  const pr = p.product;
  if (pr) {
    const dim = pr.dimensions != null ? String(pr.dimensions).trim() : "";
    const nm = pr.name != null ? String(pr.name).trim() : "";
    return dim || nm || "";
  }
  return "";
}

export function resolveCaixaDisplayType(persistedType: string, produtos: ProductPrice[]): string {
  const t = String(persistedType ?? "").trim();
  if (!t) return "";
  const ativos = produtos.filter((p) => p.active);

  let match =
    ativos.find((p) => p.type === t) ||
    ativos.find((p) => p.name === t || p.size === t) ||
    ativos.find((p) => valorSelectCaixa(p) === t);
  if (match) return valorSelectCaixa(match);

  const sep = " - ";
  const idx = t.indexOf(sep);
  if (idx !== -1) {
    const prefix = t.slice(0, idx).trim();
    match =
      ativos.find((p) => p.size === prefix || p.name === prefix) ||
      ativos.find((p) => valorSelectCaixa(p) === prefix);
    if (match) return valorSelectCaixa(match);
  }

  return t;
}

/** Hidrata o canvas a partir de data URL ou URL http(s) (assinaturas salvas no MinIO). */
export function loadDataUrlOnCanvas(
  src: string | undefined,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  if (!src?.trim() || !canvasRef.current) return;
  const s = src.trim();
  if (!s.startsWith("data:") && !s.startsWith("http://") && !s.startsWith("https://")) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.onerror = () => {
    /* CORS ou URL inválida: canvas permanece em branco; o usuário pode assinar de novo. */
  };
  img.src = s;
}

