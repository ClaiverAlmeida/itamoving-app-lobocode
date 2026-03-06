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

export type UpdateVacationDto = Partial<CreateVacationDto>;

export class VacationService { }

export const vacationService = new VacationService();