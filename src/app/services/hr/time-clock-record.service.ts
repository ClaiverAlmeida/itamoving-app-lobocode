import { api } from "../api.service";
import { RegistroPonto } from "../../types";
import { toDateOnly } from "../../utils";

export interface CreateTimeClockRecordDto {
    employeeId: string;
    employeeName: string;
    date: string;
    clockIn: string;
    lunchStart: string;
    lunchEnd: string;
    clockOut: string;
    workedHours: number;
    overtimeHours: number;
    type: "NORMAL" | "ABSENCE" | "SICK_NOTE" | "DAY_OFF";
    notes: string;
}

export interface TimeClockRecordBackend {
    id: string;
    employeeId: string;
    employeeName: string,
    date: string,
    clockIn: string,
    lunchStart: string,
    lunchEnd: string,
    clockOut: string,
    workedHours: number,
    overtimeHours: number,
    type: "NORMAL" | "ABSENCE" | "SICK_NOTE" | "DAY_OFF",
    notes: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string,
}

function mapBackendToFrontend(timeClockRecord: TimeClockRecordBackend): RegistroPonto {
    return {
        id: timeClockRecord.id,
        employeeId: timeClockRecord.employeeId,
        employeeName: timeClockRecord.employeeName,
        date: toDateOnly(timeClockRecord.date),
        clockIn: timeClockRecord.clockIn,
        lunchStart: timeClockRecord.lunchStart,
        lunchEnd: timeClockRecord.lunchEnd,
        clockOut: timeClockRecord.clockOut,
        workedHours: timeClockRecord.workedHours,
        overtimeHours: timeClockRecord.overtimeHours,
        type: timeClockRecord.type,
        notes: timeClockRecord.notes,
    }
}

export type UpdateTimeClockRecordDto = Partial<CreateTimeClockRecordDto>;

export class TimeClockRecordService {
    async getAll(): Promise<{
        success: boolean;
        data?: RegistroPonto[];
        error?: string;
    }> {
        try {
            const result = await api.get<
                TimeClockRecordBackend[] | { data: TimeClockRecordBackend[] }
            >("/hr/time-clock-record");

            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const timeClockRecordBackend = raw as TimeClockRecordBackend[];
                const timeClockRecord = timeClockRecordBackend.map(mapBackendToFrontend);
                return { success: true, data: timeClockRecord };
            }
            return { success: false, error: "Erro ao buscar os pontos dos funcionários" };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }

    async create(data: CreateTimeClockRecordDto): Promise<{ success: boolean; data?: RegistroPonto; error?: string }> {
        try {
            const result = await api.post<TimeClockRecordBackend>('/hr/time-clock-record', data);
            if (result.success && result.data) {
                const timeClockRecord = mapBackendToFrontend(result.data);
                return { success: true, data: timeClockRecord };
            }
            return { success: false, error: result.error ?? 'Erro ao criar registro de ponto' };
        }
        catch (error) {
            return { success: false, error: 'Erro ao criar registro de ponto' };
        }
    }
}

export const timeClockRecordService = new TimeClockRecordService();