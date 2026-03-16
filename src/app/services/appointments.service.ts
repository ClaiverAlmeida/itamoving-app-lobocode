import { api } from "./api.service";
import { Agendamento } from "../types";
import { toDateOnly, toTimeOnly } from "../utils";

export interface CreateAppointmentsPeriodsDTO {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  collectionArea: string;
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
  observations?: string;
}

export type UpdateAppointmentsPeriodsDTO = Partial<CreateAppointmentsPeriodsDTO>;

export interface AppointmentsPeriodsBackend {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  collectionArea: string;
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
  observations?: string;
}

export interface CreateAppointmentsDTO {
  clientId: string;
  appointmentPeriodId?: string;
  collectionDate?: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic?: boolean | false;
  qtyBoxes: number;
  address: string;
  observations?: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
}

export type UpdateAppointmentsDTO = Partial<CreateAppointmentsDTO>;

export interface AppointmentsBackend {
  id: string;
  appointmentPeriodId?: string;
  collectionDate?: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic?: boolean | false;
  qtyBoxes: number;
  address: string;
  observations?: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
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
    client: {
      id: appointment.client.id,
      name: appointment.client.usaName,
    },
    user: {
      id: appointment.user?.id ?? "",
      name: appointment.user?.name ?? "",
    },
    observations: appointment.observations ?? "",
    status: appointment.status,
    collectionDate: toDateOnly(appointment.collectionDate),
    collectionTime: toTimeOnly(appointment.collectionTime) ?? "",
    value: Number(appointment.value),
    downPayment: Number(appointment.downPayment),
    isPeriodic: Boolean(appointment.isPeriodic),
    qtyBoxes: Number(appointment.qtyBoxes),
    address: appointment.address,
    appointmentPeriodId: appointment.appointmentPeriodId ?? "",
  };
}

function mapBackendToFrontendPeriods(appointmentPeriod: AppointmentsPeriodsBackend): CreateAppointmentsPeriodsDTO {
  return {
    id: appointmentPeriod.id,
    title: appointmentPeriod.title,
    startDate: appointmentPeriod.startDate,
    endDate: appointmentPeriod.endDate,
    collectionArea: appointmentPeriod.collectionArea,
    status: appointmentPeriod.status,
    observations: appointmentPeriod.observations,
  };
}

export class AppointmentsService {
  async getAll(): Promise<{
    success: boolean;
    data?: Agendamento[];
    error?: string;
  }> {
    try {
      const result = await api.get<
        AppointmentsBackend[] | { data: AppointmentsBackend[] }
      >("/appointments");
      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const appointmentsBackend = raw as AppointmentsBackend[];
        const appointments = appointmentsBackend.map(mapBackendToFrontend);
        return { success: true, data: appointments };
      }
      return { success: false, error: result.error || "Erro ao buscar agendamentos" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao buscar agendamentos" };
    }
  }

  async getAllPeriods(): Promise<{
    success: boolean;
    data?: CreateAppointmentsPeriodsDTO[];
    error?: string;
  }> {
    try {
      const result = await api.get<
        AppointmentsPeriodsBackend[] | { data: AppointmentsPeriodsBackend[] }
      >("/appointments/periods");
      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const appointmentsPeriodsBackend = raw as AppointmentsPeriodsBackend[];
        const appointmentsPeriods = appointmentsPeriodsBackend.map(mapBackendToFrontendPeriods);
        return { success: true, data: appointmentsPeriods };
      }
      return { success: false, error: result.error || "Erro ao buscar agendamentos" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao buscar agendamentos" };
    }
  }

  async getAllQtdBoxesPerDay(collectionDate: string, isPeriodic: boolean, appointmentPeriodId: string): Promise<{
    success: boolean;
    data?: { collectionDate: string; qtyBoxes: number }[];
    error?: string;
  }> {
    try {
      const result = await api.get<
        | { collectionDate: string; qtyBoxes: number }[]
        | { data: { collectionDate: string; qtyBoxes: number }[] }
      >("/appointments/qtd-boxes-per-day", { params: { collectionDate, isPeriodic, appointmentPeriodId } });
      if (result.success && result.data) {
        const raw = result.data as any;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        return { success: true, data: list };
      }
      return {
        success: false,
        error: result.error || "Erro ao buscar quantidade de caixas por dia",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Erro ao buscar quantidade de caixas por dia",
      };
    }
  }

  async getAllQtdBoxesPerPeriod(startDate: string, endDate: string): Promise<{
    success: boolean;
    data?: { startDate: string; endDate: string; qtyBoxes: number }[];
    error?: string;
  }> {
    try {
      const result = await api.get<
        | { startDate: string; endDate: string; qtyBoxes: number }[]
        | { data: { startDate: string; endDate: string; qtyBoxes: number }[] }
      >("/appointments/qtd-boxes-per-period", { params: { startDate, endDate } });
      if (result.success && result.data) {
        const raw = result.data as any;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        return { success: true, data: list };
      }
      return {
        success: false,
        error: result.error || "Erro ao buscar quantidade de caixas por período",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Erro ao buscar quantidade de caixas por período",
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

      return { success: false, error: result.error || "Erro ao criar agendamento" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao criar agendamento" };
    }
  }

  async createPeriod(
    data: CreateAppointmentsPeriodsDTO,
  ): Promise<{ success: boolean; data?: CreateAppointmentsPeriodsDTO; error?: string }> {
    try {
      const result = await api.post<
        AppointmentsPeriodsBackend | { data: AppointmentsPeriodsBackend }
      >("/appointments/periods", data);

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const appointmentsPeriodsBackend = raw as AppointmentsPeriodsBackend;
        const period = mapBackendToFrontendPeriods(appointmentsPeriodsBackend);
        return { success: true, data: period };
      }

      return { success: false, error: result.error || "Erro ao criar agendamento" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao criar agendamento" };
    }
  }

  async update(
    id: string,
    data: UpdateAppointmentsDTO,
  ): Promise<{ success: boolean; data?: Agendamento; error?: string }> {
    try {
      const result = await api.patch<
        AppointmentsBackend | { data: AppointmentsBackend }
      >(`/appointments/${id}`, data);
      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const appointmentsBackend = raw as AppointmentsBackend;
        const appointment = mapBackendToFrontend(appointmentsBackend);
        return { success: true, data: appointment };
      }
      return { success: false, error: result.error || "Erro ao atualizar agendamento" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao atualizar agendamento" };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete<
        AppointmentsBackend | { data: AppointmentsBackend }
      >(`/appointments/${id}`);
      if (result.success && result.data) {
        return { success: true };
      }
      return { success: false, error: result.error || "Erro ao excluir agendamento" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao excluir agendamento" };
    }
  }
}

export const appointmentsService = new AppointmentsService();
