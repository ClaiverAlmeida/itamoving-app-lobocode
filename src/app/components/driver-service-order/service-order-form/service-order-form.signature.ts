import type React from "react";
import { uploadServiceOrderSignature } from "../../../api";

export function isHttpSignatureUrl(s: string): boolean {
  const t = String(s ?? "").trim();
  return t.startsWith("http://") || t.startsWith("https://");
}

export function isDataImageUrl(s: string): boolean {
  return String(s ?? "").trim().startsWith("data:image");
}

/** Decodifica data URL já em PNG (sem reencodar). */
export function dataUrlToPngFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename.endsWith(".png") ? filename : `${filename}.png`, { type: mime });
}

/**
 * Converte qualquer data URL de imagem para PNG via canvas (evita JPEG: sem alpha,
 * o fundo transparente vira preto/cinza e parece “negativo” ou invertido).
 */
async function dataUrlToPngFileViaCanvas(dataUrl: string, filename: string): Promise<File> {
  const mime = dataUrl.split(",")[0]?.match(/data:(.*?);/)?.[1] || "";
  if (mime === "image/png") {
    return dataUrlToPngFile(dataUrl, filename);
  }
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem da assinatura"));
    img.src = dataUrl;
  });
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao gerar PNG"));
          return;
        }
        resolve(new File([blob], filename.endsWith(".png") ? filename : `${filename}.png`, { type: "image/png" }));
      },
      "image/png",
    );
  });
}

/**
 * Exporta assinatura **somente** como PNG (preserva transparência do canvas; sem JPEG).
 */
export async function canvasOrDataUrlToSignatureFile(
  canvas: HTMLCanvasElement | null,
  dataUrlFallback: string,
): Promise<File> {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const name = `sig-${id}.png`;

  if (canvas) {
    const fromBlob = await new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(new File([blob], name, { type: "image/png" }));
        },
        "image/png",
      );
    });
    if (fromBlob) return fromBlob;
    const pngDataUrl = canvas.toDataURL("image/png");
    return dataUrlToPngFile(pngDataUrl, name);
  }

  if (isDataImageUrl(dataUrlFallback)) {
    return dataUrlToPngFileViaCanvas(dataUrlFallback, name);
  }
  throw new Error("Assinatura inválida para envio");
}

export async function resolveSignatureToMinioUrl(params: {
  raw: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  dirtyRef: React.MutableRefObject<boolean>;
  serviceOrderId: string;
  role: "client" | "agent";
}): Promise<string | null> {
  const v = String(params.raw ?? "").trim();
  if (!v) return null;

  if (isHttpSignatureUrl(v) && !params.dirtyRef.current) {
    return v;
  }

  try {
    const file = await canvasOrDataUrlToSignatureFile(params.canvasRef.current, v);
    const res = await uploadServiceOrderSignature({
      file,
      serviceOrderId: params.serviceOrderId,
      role: params.role,
    });
    if (!res.success || !res.data?.url) {
      return null;
    }
    return res.data.url;
  } catch {
    return null;
  }
}
