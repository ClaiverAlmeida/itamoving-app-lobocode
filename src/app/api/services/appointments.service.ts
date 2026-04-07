import { api } from "./api.service";
import type { Appointment } from "../types";
import { toDateOnly, toTimeOnly } from "../../utils";
import { BaseCrudService } from "./base-crud.service";
import type {
  AppointmentsBackend,
  AppointmentsPeriodsBackend,
  CreateAppointmentsDTO,
  CreateAppointmentsPeriodsDTO,
  UpdateAppointmentsDTO,
  UpdateAppointmentsPeriodsDTO,
} from "../types";

type AppointmentsPeriodsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const EMPTY_USA_ADDRESS = "—";

function trimAddr(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

type UsaAddressFields = AppointmentsBackend["client"]["usaAddress"];

/** Monta uma linha de endereço EUA para exibição; seguro com `usaAddress` ausente ou campos vazios. */
function formatUsaAddressForAppointment(usa: Partial<UsaAddressFields> | null | undefined): string {
  const u = usa ?? {};
  const rua = trimAddr(u.rua);
  const numero = trimAddr(u.numero);
  const complemento = trimAddr(u.complemento);
  const cidade = trimAddr(u.cidade);
  const estado = trimAddr(u.estado);
  const zipCode = trimAddr(u.zipCode);

  const street = [rua, numero].filter(Boolean).join(", ");
  const addressLine = [street, complemento].filter(Boolean).join(" - ");
  const cityLine = [cidade, estado].filter(Boolean).join(" - ");
  const parts = [addressLine, cityLine, zipCode].filter(Boolean);
  return parts.length ? parts.join(", ") : EMPTY_USA_ADDRESS;
}

export function mapBackendToFrontend(appointment: AppointmentsBackend): Appointment {
  const usaAddress = formatUsaAddressForAppointment(appointment.client?.usaAddress);

  return {
    id: appointment.id,
    client: {
      id: appointment.client.id,
      name: appointment.client.usaName,
      usaAddress: usaAddress,
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
    containerId: appointment.containerId ?? "",
    appointmentPeriodId: appointment.appointmentPeriodId ?? "",
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
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

class AppointmentsPeriodsCrudService extends BaseCrudService<
  CreateAppointmentsPeriodsDTO,
  AppointmentsPeriodsBackend,
  CreateAppointmentsPeriodsDTO,
  UpdateAppointmentsPeriodsDTO,
  AppointmentsPeriodsPagination
> {
  constructor() {
    super("/appointments/periods", mapBackendToFrontendPeriods, {
      listError: "Erro ao buscar períodos",
      createError: "Erro ao criar período de coleta",
      updateError: "Erro ao atualizar período de coleta",
      deleteError: "Erro ao excluir período de coleta",
    }, true);
  }
}

export class AppointmentsService extends BaseCrudService<
  Appointment,
  AppointmentsBackend,
  CreateAppointmentsDTO,
  UpdateAppointmentsDTO
> {
  private readonly periodsService = new AppointmentsPeriodsCrudService();

  constructor() {
    super("/appointments", mapBackendToFrontend, {
      listError: "Erro ao buscar agendamentos",
      createError: "Erro ao criar agendamento",
      updateError: "Erro ao atualizar agendamento",
      deleteError: "Erro ao excluir agendamento",
    });
  }

  async getAllPeriods(
    page = 1,
    limit = 10,
  ): Promise<{
    success: boolean;
    data?: CreateAppointmentsPeriodsDTO[];
    pagination?: AppointmentsPeriodsPagination;
    error?: string;
  }> {
    return this.periodsService.getAll(page, limit);
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

  async createPeriod(
    data: CreateAppointmentsPeriodsDTO,
  ): Promise<{ success: boolean; data?: CreateAppointmentsPeriodsDTO; error?: string }> {
    return this.periodsService.create(data);
  }

  async updatePeriod(
    id: string,
    data: UpdateAppointmentsPeriodsDTO,
  ): Promise<{ success: boolean; data?: CreateAppointmentsPeriodsDTO; error?: string }> {
    return this.periodsService.update(id, data);
  }

}

export const appointmentsService = new AppointmentsService();
