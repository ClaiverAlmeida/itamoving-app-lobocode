import { api } from "./api.service";
import { BaseCrudService } from "./base-crud.service";
import type { Company, CompanyBackend, UpdateCompanyDTO } from "../types";

function mapBackendToFrontend(company: CompanyBackend): Company {
    return {
        name: company.name,
        website: company.website,
        address: company.address,
        country: company.country,
        contactName: company.contactName,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
    };
}

export class ConfigurationsService extends BaseCrudService<
    Company,
    CompanyBackend,
    UpdateCompanyDTO,
    UpdateCompanyDTO
> {
    constructor() {
        super("/companies/configurations", mapBackendToFrontend, {
            updateError: "Erro ao atualizar configurações da empresa",
            listError: "Erro ao buscar configurações da empresa",
        });
    }

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
}

export const configurationsService = new ConfigurationsService();