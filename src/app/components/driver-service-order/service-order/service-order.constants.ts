import type { DriverServiceOrder } from "../../../api";

export const STATUS_LABEL: Record<DriverServiceOrder["status"], string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
};

