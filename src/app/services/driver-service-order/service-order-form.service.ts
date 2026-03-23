import { api } from "../api.service";
import { OrdemServicoMotorista } from '../../types';

export interface OrdemServicoFormProps {
    appointmentId: string;
    agendamento: any;
    onClose: () => void;
    onSave?: (ordem: OrdemServicoMotorista) => void;
    /** Recarrega lista de agendamentos (e estoque) no app após salvar a ordem */
    onAgendamentosAtualizados?: () => void | Promise<void>;
    embedded?: boolean;
}

export interface Caixa {
    id: string;
    type: string;
    number: string;
    value: number;
    weight: number;
}

export interface Item {
    id: string;
    /** Caixa à qual o item pertence */
    caixaId: string;
    name: string;
    quantity: number;
    weight: number;
    observations?: string;
}

export class ServiceOrderFormService {
    async create(data: OrdemServicoMotorista): Promise<{ success: boolean; data?: OrdemServicoMotorista; error?: string }> {
        try {
            const result = await api.post<OrdemServicoMotorista | { data: OrdemServicoMotorista }>("/driver-service-order", data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const serviceOrder = raw as OrdemServicoMotorista;
                return { success: true, data: serviceOrder };
            }
            return { success: false, error: result.error || "Erro ao criar ordem de serviço" };
        } catch (error) {
            return { success: false, error: error.message || "Erro ao criar ordem de serviço" };
        }
    }
}

export const serviceOrderFormService = new ServiceOrderFormService();