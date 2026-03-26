import type { PrecoProduto } from "../../../api";

export function valorSelectCaixa(p: PrecoProduto): string {
  return p.size || p.name;
}

export function resolveCaixaDisplayType(persistedType: string, produtos: PrecoProduto[]): string {
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

export function loadDataUrlOnCanvas(
  dataUrl: string | undefined,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  if (!dataUrl?.startsWith("data:") || !canvasRef.current) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = dataUrl;
}

