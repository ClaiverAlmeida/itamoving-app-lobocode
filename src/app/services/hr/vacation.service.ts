import { api } from "../api.service";
import { Ferias } from "../../types";
import { toDateOnly } from "../../utils";

export interface CreateVacationDto {
    employeeId: string;
    employeeName: string;
    accrualPeriod: string;
    startDate: string;
    endDate: string;
    daysTaken: number;
    status: "REQUESTED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    notes?: string;
}

export type UpdateVacationDto = Partial<CreateVacationDto>;

export interface VacationBackend {
    id: string;
    employeeId: string;
    employeeName: string;
    accrualPeriod: string;
    startDate: string;
    endDate: string;
    daysTaken: number;
    status: "REQUESTED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    notes?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
}

function mapBackendToFrontend(vacation: VacationBackend): Ferias {
    return {
        id: vacation.id,
        employeeId: vacation.employeeId,
        employeeName: vacation.employeeName,
        accrualPeriod: vacation.accrualPeriod,
        startDate: toDateOnly(vacation.startDate),
        endDate: toDateOnly(vacation.endDate),
        daysTaken: vacation.daysTaken,
        status: vacation.status,
        notes: vacation.notes,
    }
}

export class VacationService {
    async getAll(): Promise<{
        success: boolean;
        data?: Ferias[];
        error?: string;
    }> {
        try {
            const result = await api.get<
                VacationBackend[] | { data: VacationBackend[] }
            >("/hr/vacation");

            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const vacationBackend = raw as VacationBackend[];
                const vacation = vacationBackend.map(mapBackendToFrontend);
                return { success: true, data: vacation };
            }
            return { success: false, error: "Erro ao buscar as férias dos funcionários" };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }

    async create(data: Ferias): Promise<{ success: boolean; data?: Ferias; error?: string }> {
        try {
            const result = await api.post<Ferias | { data: Ferias }>("/hr/vacation", data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const vacationBackend = raw as VacationBackend;
                const vacation = mapBackendToFrontend(vacationBackend);
                return { success: true, data: vacation };
            }
            return { success: false, error: "Erro ao criar férias do funcionário" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const vacationService = new VacationService();