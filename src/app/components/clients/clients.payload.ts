import type { Client, CreateClientsDTO, UpdateClientsDTO } from "../../api";
import type { ClientFormData } from "./hooks/useClientsForm";
import {
  optTrim,
  buildOptionalUsaAddress,
  buildOptionalBrazilAddress,
  buildCreateClientsPayload,
} from "./clients-form.utils";

export { buildCreateClientsPayload };

function usaAddressAsForm(usa: Record<string, unknown> | undefined): ClientFormData["usaAddress"] {
  const u = usa ?? {};
  return {
    rua: String(u.rua ?? ""),
    numero: String(u.numero ?? ""),
    cidade: String(u.cidade ?? ""),
    estado: String(u.estado ?? ""),
    zipCode: String(u.zipCode ?? ""),
    complemento: String(u.complemento ?? ""),
  };
}

function brAddressAsForm(br: Record<string, unknown> | undefined): ClientFormData["brazilAddress"] {
  const b = br ?? {};
  return {
    rua: String(b.rua ?? ""),
    bairro: String(b.bairro ?? ""),
    numero: String(b.numero ?? ""),
    cidade: String(b.cidade ?? ""),
    estado: String(b.estado ?? ""),
    cep: String(b.cep ?? ""),
    complemento: String(b.complemento ?? ""),
  };
}

export function buildClientUpdatePayload(
  formData: ClientFormData,
  editingCliente: Client,
): UpdateClientsDTO {
  const next = buildCreateClientsPayload(formData);
  const patch: UpdateClientsDTO = {};

  if (next.usaName !== editingCliente.usaName) patch.usaName = next.usaName;

  const pUsaCpf = optTrim(editingCliente.usaCpf ?? "");
  if (next.usaCpf !== pUsaCpf) patch.usaCpf = next.usaCpf;

  const pUsaPhone = optTrim(editingCliente.usaPhone ?? "");
  if (next.usaPhone !== pUsaPhone) patch.usaPhone = next.usaPhone;

  const pBrazilName = optTrim(editingCliente.brazilName ?? "");
  if (next.brazilName !== pBrazilName) patch.brazilName = next.brazilName;

  const pBrazilCpf = optTrim(editingCliente.brazilCpf ?? "");
  if (next.brazilCpf !== pBrazilCpf) patch.brazilCpf = next.brazilCpf;

  const pBrazilPhone = optTrim(editingCliente.brazilPhone ?? "");
  if (next.brazilPhone !== pBrazilPhone) patch.brazilPhone = next.brazilPhone;

  if (next.userId !== (editingCliente.user?.id ?? "")) patch.userId = next.userId;

  if (
    next.status !==
    (editingCliente.status === "ACTIVE" ? "ACTIVE" : "INACTIVE")
  )
    patch.status = next.status;

  const nextUsa = buildOptionalUsaAddress(formData.usaAddress);
  const prevUsa = buildOptionalUsaAddress(usaAddressAsForm(editingCliente.usaAddress as Record<string, unknown>));
  if (JSON.stringify(nextUsa) !== JSON.stringify(prevUsa) && nextUsa !== undefined) {
    patch.usaAddress = nextUsa as CreateClientsDTO["usaAddress"];
  }

  const nextBr = buildOptionalBrazilAddress(formData.brazilAddress);
  const prevBr = buildOptionalBrazilAddress(
    brAddressAsForm(editingCliente.brazilAddress as Record<string, unknown>),
  );
  if (JSON.stringify(nextBr) !== JSON.stringify(prevBr) && nextBr !== undefined) {
    patch.brazilAddress = nextBr as CreateClientsDTO["brazilAddress"];
  }

  return patch;
}
