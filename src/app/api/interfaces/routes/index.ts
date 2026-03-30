import type { Appointment } from "../appointments";

export interface Route {
  id: string;
  data: string;
  agendamentos: Appointment[];
  rotaOtimizada: string[];
  distanciaTotal: number;
  tempoEstimado: number;
}
