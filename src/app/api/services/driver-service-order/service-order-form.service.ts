import { api } from "../api.service";
import type { DriverServiceOrder } from '../../interfaces/service-order';
import type { UpdateOrdemServicoDTO } from '../../types';
import {
    extractDriverServiceOrderList,
    mapDriverServiceOrderApiToView,
    type DriverServiceOrderView,
} from "./driver-service-order.mapper";

export type { DriverServiceOrderView };

export class ServiceOrderFormService {
    /**
     * Lista ordens (resposta paginada `{ data, pagination }` ou array) e normaliza para o modelo do app.
     */
    async getAll(): Promise<{ success: boolean; data?: DriverServiceOrderView[]; error?: string }> {
        try {
            const result = await api.get<unknown>("/driver-service-order");
            if (result.success && result.data != null) {
                const list = extractDriverServiceOrderList(result.data);
                const mapped = list
                    .map((row) => mapDriverServiceOrderApiToView(row))
                    .filter((o): o is DriverServiceOrderView => o != null);
                return { success: true, data: mapped };
            }
            return { success: false, error: result.error || "Erro ao buscar ordens de serviço" };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Erro ao buscar ordens de serviço";
            return { success: false, error: msg };
        }
    }

    /** Ordens arquivadas (`deletedAt`), apenas para perfis com permissão no backend. */
    async getArchived(): Promise<{ success: boolean; data?: DriverServiceOrderView[]; error?: string }> {
        try {
            const result = await api.get<unknown>("/driver-service-order/archived");
            if (result.success && result.data != null) {
                const list = extractDriverServiceOrderList(result.data);
                const mapped = list
                    .map((row) => mapDriverServiceOrderApiToView(row))
                    .filter((o): o is DriverServiceOrderView => o != null);
                return { success: true, data: mapped };
            }
            return { success: false, error: result.error || "Erro ao buscar ordens arquivadas" };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Erro ao buscar ordens arquivadas";
            return { success: false, error: msg };
        }
    }

    async getAllCompletedAndNotAssignedToContainer(): Promise<{ success: boolean; data?: DriverServiceOrderView[]; error?: string }> {
        try {
            const result = await api.get<unknown>("/driver-service-order/completed");
            if (result.success && result.data != null) {
                const list = extractDriverServiceOrderList(result.data);
                const mapped = list
                    .map((row) => mapDriverServiceOrderApiToView(row))
                    .filter((o): o is DriverServiceOrderView => o != null);
                return { success: true, data: mapped };
            }
            return { success: false, error: result.error || "Erro ao buscar ordens de serviço completas e não atribuídas a container" };
        }
        catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Erro ao buscar ordens de serviço completas e não atribuídas a container";
            return { success: false, error: msg };
        }
    }

    /** Ordem completa (caixas e itens) para edição — mesmo payload do GET por id. */
    async getById(
        id: string,
        options?: { includeDeleted?: boolean },
    ): Promise<{ success: boolean; data?: DriverServiceOrderView; error?: string }> {
        try {
            const q =
                options?.includeDeleted === true
                    ? "?includeDeleted=true"
                    : "";
            const result = await api.get<unknown>(`/driver-service-order/${id}${q}`);
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

    async create(
        data: DriverServiceOrder,
    ): Promise<{ success: boolean; data?: DriverServiceOrderView; error?: string }> {
        try {
            const result = await api.post<DriverServiceOrder | { data: DriverServiceOrder }>("/driver-service-order", data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const mapped = mapDriverServiceOrderApiToView(raw);
                if (mapped) return { success: true, data: mapped };
                return { success: false, error: "Resposta inválida da ordem de serviço" };
            }
            return { success: false, error: result.error || "Erro ao criar ordem de serviço" };
        } catch (error) {
            return { success: false, error: error.message || "Erro ao criar ordem de serviço" };
        }
    }

    async update(id: string, data: UpdateOrdemServicoDTO): Promise<{ success: boolean; data?: DriverServiceOrder; error?: string }> {
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
            return { success: false, error: result.error || "Erro ao arquivar ordem de serviço" };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Erro ao arquivar ordem de serviço" };
        }
    }

    async restore(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await api.post<unknown>(`/driver-service-order/${id}/restore`, {});
            if (result.success) {
                return { success: true };
            }
            return { success: false, error: result.error || "Erro ao desarquivar ordem de serviço" };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Erro ao desarquivar ordem de serviço" };
        }
    }
}

export const serviceOrderFormService = new ServiceOrderFormService();