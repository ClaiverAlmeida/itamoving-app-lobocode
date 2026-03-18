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

  async getAllPeriods(
    page = 1,
    limit = 10,
  ): Promise<{
    success: boolean;
    data?: CreateAppointmentsPeriodsDTO[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    error?: string;
  }> {
    try {
      const result = await api.get<{
        data: AppointmentsPeriodsBackend[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>("/appointments/periods", { params: { page, limit } });
      if (result.success && result.data != null) {
        const body = result.data as {
          data?: AppointmentsPeriodsBackend[];
          pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
          };
        };
        const rawList = body.data;
        if (!Array.isArray(rawList)) {
          return { success: false, error: "Resposta inválida ao buscar períodos" };
        }
        const appointmentsPeriods = rawList.map(mapBackendToFrontendPeriods);
        return {
          success: true,
          data: appointmentsPeriods,
          pagination: body.pagination,
        };
      }
      return { success: false, error: result.error || "Erro ao buscar períodos" };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao buscar períodos";
      return { success: false, error: msg };
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
    data?: { collectionDate: string; qtyBoxes: number }[];
    semDiaColetaNoPeriodo?: number;
    error?: string;
  }> {
    try {
      const result = await api.get<
        | { collectionDate: string; qtyBoxes: number }[]
        | {
            data: { collectionDate: string; qtyBoxes: number }[];
            semDiaColetaNoPeriodo?: number;
          }
      >("/appointments/qtd-boxes-per-period", { params: { startDate, endDate } });
      if (result.success && result.data) {
        const raw = result.data as any;
        let list: { collectionDate: string; qtyBoxes: number }[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (Array.isArray(raw?.data)) {
          list = raw.data;
        } else if (raw?.data && typeof raw.data === "object" && Array.isArray(raw.data.data)) {
          list = raw.data.data;
        }
        const semDiaColetaNoPeriodo = Number(
          raw?.semDiaColetaNoPeriodo ??
            raw?.data?.semDiaColetaNoPeriodo ??
            0,
        );
        return {
          success: true,
          data: list,
          semDiaColetaNoPeriodo: Number.isFinite(semDiaColetaNoPeriodo) ? semDiaColetaNoPeriodo : 0,
        };
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

  async updatePeriod(
    id: string,
    data: UpdateAppointmentsPeriodsDTO,
  ): Promise<{ success: boolean; data?: CreateAppointmentsPeriodsDTO; error?: string }> {
    try {
      const result = await api.patch<
        AppointmentsPeriodsBackend | { data: AppointmentsPeriodsBackend }
      >(`/appointments/periods/${id}`, data);
      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const appointmentsPeriodsBackend = raw as AppointmentsPeriodsBackend;
        const period = mapBackendToFrontendPeriods(appointmentsPeriodsBackend);
        return { success: true, data: period };
      }
      return { success: false, error: result.error || "Erro ao atualizar período de coleta" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao atualizar período de coleta" };
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
