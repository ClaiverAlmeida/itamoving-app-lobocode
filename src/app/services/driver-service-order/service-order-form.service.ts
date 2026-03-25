import { api } from "../api.service";
import { OrdemServicoMotorista } from '../../types';
import {
    extractDriverServiceOrderList,
    mapDriverServiceOrderApiToView,
    type OrdemServicoView,
} from "./driver-service-order.mapper";

export type { OrdemServicoView };

export interface OrdemServicoFormProps {
    appointmentId: string;
    agendamento: any;
    onClose: () => void;
    onSave?: (ordem: OrdemServicoMotorista) => void;
    /** Recarrega lista de agendamentos (e estoque) no app após salvar a ordem */
    onAgendamentosAtualizados?: () => void | Promise<void>;
    embedded?: boolean;
    /**
     * Quando definido, o formulário pré-preenche com a ordem existente (edição / back-office).
     * `onSave` recebe o payload final; a tela pode persistir sem chamar a API de create.
     */
    existingOrdem?: OrdemServicoMotorista;
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

export type UpdateOrdemServicoDTO = Partial<OrdemServicoMotorista>;

export class ServiceOrderFormService {
    /**
     * Lista ordens (resposta paginada `{ data, pagination }` ou array) e normaliza para o modelo do app.
     */
    async getAll(): Promise<{ success: boolean; data?: OrdemServicoView[]; error?: string }> {
        try {
            const result = await api.get<unknown>("/driver-service-order");
            if (result.success && result.data != null) {
                const list = extractDriverServiceOrderList(result.data);
                const mapped = list
                    .map((row) => mapDriverServiceOrderApiToView(row))
                    .filter((o): o is OrdemServicoView => o != null);
                return { success: true, data: mapped };
            }
            return { success: false, error: result.error || "Erro ao buscar ordens de serviço" };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Erro ao buscar ordens de serviço";
            return { success: false, error: msg };
        }
    }

    /** Ordem completa (caixas e itens) para edição — mesmo payload do GET por id. */
    async getById(id: string): Promise<{ success: boolean; data?: OrdemServicoView; error?: string }> {
        try {
            const result = await api.get<unknown>(`/driver-service-order/${id}`);
            if (result.success && result.data != null) {
                const raw = (result.data as { data?: unknown })?.data ?? result.data;
                const mapped = mapDriverServiceOrderApiToView(raw);
                if (mapped) return { success: true, data: mapped };
                return { success: false, error: "Resposta inválida da ordem de serviço" };
            }
            return { success: false, error: result.error || "Erro ao buscar ordem de serviço" };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Erro ao buscar ordem de serviço";
            return { success: false, error: msg };
        }
    }

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

    async update(id: string, data: UpdateOrdemServicoDTO): Promise<{ success: boolean; data?: OrdemServicoMotorista; error?: string }> {
        try {
            const result = await api.patch<unknown>(`/driver-service-order/${id}`, data);
            if (result.success && result.data != null) {
                const raw = (result.data as any)?.data ?? result.data;
                const mapped = mapDriverServiceOrderApiToView(raw);
                if (mapped) return { success: true, data: mapped };
                return { success: false, error: 'Resposta inválida da ordem de serviço' };
            }
            return { success: false, error: result.error || "Erro ao atualizar ordem de serviço" };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar ordem de serviço" };
        }
    }

    async delete(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await api.delete<unknown>(`/driver-service-order/${id}`);
            if (result.success) {
                return { success: true };
            }
            return { success: false, error: result.error || "Erro ao excluir ordem de serviço" };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Erro ao excluir ordem de serviço" };
        }
    }
}

export const serviceOrderFormService = new ServiceOrderFormService();