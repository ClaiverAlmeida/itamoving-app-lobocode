import { api } from "./api.service";

export interface AgendamentoConfirmedBackend {
    id?: string;
    appointmentPeriodId?: string;
    collectionDate?: string;
    collectionTime: string;
    value: number;
    downPayment: number;
    isPeriodic?: boolean | false;
    qtyBoxes: number;
    address: string;
    observations?: string;
    user: {
        id: string;
        name: string;
    };
    client: {
        id: string;
        usaName: string;
        usaCpf: string;
        usaPhone: string;
        usaAddress: {
            rua: string;
            numero: string;
            cidade: string;
            estado: string;
            zipCode: string;
            complemento: string;
        };
        brazilAddress: {
            rua: string;
            bairro: string;
            numero: string;
            cidade: string;
            estado: string;
            cep: string;
            complemento: string;
        };
        brazilName: string;
        brazilCpf: string;
        brazilPhone: string;
    };
    company: {
        address: string;
        contactPhone: string;
    };
    status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
}

export class DriverAppService {
    async getConfirmedAppointments(): Promise<{
        success: boolean;
        data?: AgendamentoConfirmedBackend[];
        error?: string;
    }> {
        try {
            const result = await api.get('/appointments/confirmed');
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                return { success: true, data: raw as AgendamentoConfirmedBackend[] };
            }
            return { success: false, error: result.error ?? "Erro ao buscar agendamentos confirmados do dia" };
        } catch (error: any) {
            return { success: false, error: error.message ?? "Erro ao buscar agendamentos confirmados do dia" };
        }
    }
}

export const driverAppService = new DriverAppService();