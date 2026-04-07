import { api } from "./api.service";

export type UploadedFileRecord = {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  type: string;
  size: number;
  mimeType: string;
};

/**
 * Upload de assinatura da ordem de serviço (MinIO: `.../service-orders/{orderId}/signature-client.png` ou `signature-agent.png`; substitui na reedição).
 */
export async function uploadServiceOrderSignature(params: {
  file: File;
  serviceOrderId: string;
  role: "client" | "agent";
}): Promise<{ success: boolean; data?: UploadedFileRecord; error?: string }> {
  const fd = new FormData();
  fd.append("file", params.file);
  const qs = new URLSearchParams({
    type: "OTHER",
    serviceOrderId: params.serviceOrderId,
    signatureRole: params.role,
  });
  return api.postFormData<UploadedFileRecord>(`/files/upload?${qs.toString()}`, fd);
}
