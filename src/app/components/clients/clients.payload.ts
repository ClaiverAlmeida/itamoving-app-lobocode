import type { Client, CreateClientsDTO, UpdateClientsDTO } from "../../api";
import type { ClientFormData } from "./hooks/useClientsForm";

export function buildClientUpdatePayload(
  formData: ClientFormData,
  editingCliente: Client,
): UpdateClientsDTO {
  const current: CreateClientsDTO = {
    usaName: formData.usaName,
    usaCpf: formData.usaCpf,
    usaPhone: formData.usaPhone,
    usaAddress: formData.usaAddress,
    brazilName: formData.brazilName,
    brazilCpf: formData.brazilCpf,
    brazilPhone: formData.brazilPhone,
    brazilAddress: formData.brazilAddress,
    userId: formData.userId,
    status: formData.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
  };

  const origUsaAddr = editingCliente.usaAddress as {
    rua?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
    zipCode?: string;
    complemento?: string;
  };
  const origBrAddr = editingCliente.brazilAddress as {
    rua?: string;
    bairro?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
  };

  const patch: UpdateClientsDTO = {};

  if (current.usaName !== editingCliente.usaName) patch.usaName = current.usaName;
  if (current.usaCpf !== editingCliente.usaCpf) patch.usaCpf = current.usaCpf;
  if (current.usaPhone !== editingCliente.usaPhone)
    patch.usaPhone = current.usaPhone;
  if (current.brazilName !== editingCliente.brazilName)
    patch.brazilName = current.brazilName;
  if (current.brazilCpf !== editingCliente.brazilCpf)
    patch.brazilCpf = current.brazilCpf;
  if (current.brazilPhone !== editingCliente.brazilPhone)
    patch.brazilPhone = current.brazilPhone;
  if (current.userId !== (editingCliente.user?.id ?? ""))
    patch.userId = current.userId;
  if (
    current.status !==
    (editingCliente.status === "ACTIVE" ? "ACTIVE" : "INACTIVE")
  )
    patch.status = current.status;

  const usaAddressChanged =
    current.usaAddress.rua !== (origUsaAddr?.rua ?? "") ||
    current.usaAddress.numero !== (origUsaAddr?.numero ?? "") ||
    current.usaAddress.cidade !== (origUsaAddr?.cidade ?? "") ||
    current.usaAddress.estado !== (origUsaAddr?.estado ?? "") ||
    current.usaAddress.zipCode !== (origUsaAddr?.zipCode ?? "") ||
    (current.usaAddress.complemento ?? "") !== (origUsaAddr?.complemento ?? "");
  if (usaAddressChanged) patch.usaAddress = current.usaAddress;

  const brazilDestChanged =
    current.brazilAddress.rua !== (origBrAddr?.rua ?? "") ||
    current.brazilAddress.bairro !== (origBrAddr?.bairro ?? "") ||
    current.brazilAddress.numero !== (origBrAddr?.numero ?? "") ||
    current.brazilAddress.cidade !== (origBrAddr?.cidade ?? "") ||
    current.brazilAddress.estado !== (origBrAddr?.estado ?? "") ||
    current.brazilAddress.cep !== (origBrAddr?.cep ?? "");
  if (brazilDestChanged) patch.brazilAddress = current.brazilAddress;

  return patch;
}
