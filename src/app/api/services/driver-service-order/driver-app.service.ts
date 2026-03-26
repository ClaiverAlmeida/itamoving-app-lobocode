import type { AgendamentoConfirmedBackend } from "../../types";
import { BaseCrudService } from "../base-crud.service";

function mapBackendToFrontend(
    appointment: AgendamentoConfirmedBackend,
): AgendamentoConfirmedBackend {
    return appointment;
}

export class DriverAppService extends BaseCrudService<
    AgendamentoConfirmedBackend,
    AgendamentoConfirmedBackend
> {

    constructor() {
        super('/appointments/confirmed', mapBackendToFrontend, {
            listError: "Erro ao buscar agendamentos confirmados do dia",
        });
    }
    
    async getConfirmedAppointments(): Promise<{
        success: boolean;
        data?: AgendamentoConfirmedBackend[];
        error?: string;
    }> {
        return this.getAll();
    }
}

export const driverAppService = new DriverAppService();