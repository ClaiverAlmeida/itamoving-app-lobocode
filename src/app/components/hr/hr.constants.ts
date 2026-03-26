import type { Usuario } from "../../api";

export const HR_ROLES: Usuario["role"][] = [
  "ADMIN",
  "COMERCIAL",
  "LOGISTICS",
  "DRIVER",
];

export const HR_ROLE_LABELS: Record<Usuario["role"], string> = {
  ADMIN: "Administrador",
  COMERCIAL: "Comercial",
  LOGISTICS: "Logística",
  DRIVER: "Motorista",
};

export const HR_STATUS_LABELS: Record<Usuario["status"], string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  PENDING: "Pendente",
  ON_LEAVE: "Férias",
  TERMINATED: "Demitido",
};

