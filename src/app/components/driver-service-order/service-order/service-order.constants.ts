import type { OrdemServicoMotorista } from "../../../api";

export const STATUS_LABEL: Record<OrdemServicoMotorista["status"], string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
};

