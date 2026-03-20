import { api } from "./api.service";

export interface Company {
    name: string;
    website: string;
    address: string;
    country: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
};

export type UpdateCompanyDTO = Partial<Company>;

export interface CompanyBackend {
    id: string;
    name: string;
    website: string;
    address: string;
    country: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    createdAt: string;
    updatedAt: string;
    deletedA?: string;
}

export class ConfigurationsService {
    async getConfigurations() {
        try {

            const result = await api.get('/companies/configurations');
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                return { success: true, data: raw as CompanyBackend };
            }
            return { success: false, error: result.error ?? "Erro ao buscar configurações da empresa" };
        } catch (error: any) {
            return { success: false, error: error.message ?? "Erro ao buscar configurações da empresa" };
        }
    }

    async update(id: string, data: Company): Promise<{ success: boolean; data?: Company; error?: string }> {
        try {
            const result = await api.patch(`/companies/configurations/${id}`, data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                return { success: true, data: raw as Company };
            }
            return { success: false, error: result.error ?? "Erro ao atualizar configurações da empresa" };
        }
        catch (error: any) {
            return { success: false, error: error.message ?? "Erro ao atualizar configurações da empresa" };
        }
    }
}

export const configurationsService = new ConfigurationsService();