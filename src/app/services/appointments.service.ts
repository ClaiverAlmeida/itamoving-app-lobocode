import { api } from "./api.service";
import { Agendamento } from "../types";

export interface CreateAppointmentsDTO {
  clientId: string;
  collectionDate: string;
  collectionTime: string;
  qtyBoxes: number;
  address: string;
  observations?: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
}

export interface AppointmentsBackend {
  id: string;
  collectionDate: string;
  collectionTime: string;
  qtyBoxes: number;
  address: string;
  observations?: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  /** Atendente (vindo do backend com include da relação user) */
  user?: {
    id: string;
    name: string;
  };
  /** Cliente (vindo do backend com include da relação client; usa usaName do schema) */
  client: {
    id: string;
    usaName: string;
  };
}

function mapBackendToFrontend(appointment: AppointmentsBackend): Agendamento {
  return {
    id: appointment.id,
    clientId: appointment.client.id,
    clientName: appointment.client.usaName,
    userId: appointment.user?.id ?? "",
    observations: appointment.observations,
    status: appointment.status,
    collectionDate: appointment.collectionDate,
    collectionTime: appointment.collectionTime,
    qtyBoxes: appointment.qtyBoxes,
    address: appointment.address,
  };
}

export class AppointmentsService {
  async getAllQtdBoxesPerDay(date: string): Promise<{
    success: boolean;
    data?: { collectionDate: string; qtyBoxes: number }[];
    error?: string;
  }> {
    try {
      const result = await api.get<
        | { collectionDate: string; qtyBoxes: number }[]
        | { data: { collectionDate: string; qtyBoxes: number }[] }
      >("/appointments/qtd-boxes-per-day", { params: { date } });
      if (result.success && result.data) {
        const raw = result.data as any;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        return { success: true, data: list };
      }
      return {
        success: false,
        error: "Erro ao buscar quantidade de caixas por dia",
      };
    } catch (error) {
      return {
        success: false,
        error: "Erro ao buscar quantidade de caixas por dia",
      };
    }
  }

  async create(
    data: CreateAppointmentsDTO,
  ): Promise<{ success: boolean; data?: Agendamento; error?: string }> {
    try {
      const result = await api.post<
        AppointmentsBackend | { data: AppointmentsBackend }
      >("/appointments", data);

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const appointmentsBackend = raw as AppointmentsBackend;
        const appointment = mapBackendToFrontend(appointmentsBackend);
        return { success: true, data: appointment };
      }

      return { success: false, error: "Erro ao criar agendamento" };
    } catch (error) {
      return { success: false, error: "Erro ao criar agendamento" };
    }
  }
}

export const appointmentsService = new AppointmentsService();
