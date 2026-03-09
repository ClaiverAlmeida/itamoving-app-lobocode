import { api } from "../api.service";
import { Usuario } from "../../types";
import { toDateOnly } from "../../utils";

export interface CreateUsersDTO {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    hireDate: string;
    terminationDate?: string;
    position: "ADMIN" | "COMERCIAL" | "LOGISTICS" | "DRIVER";
    salary: number;
    contractType: "CLT" | "PJ" | "TEMPORARY" | "INTERNSHIP";
    status: "ACTIVE" | "ON_LEAVE" | "ABSENT" | "TERMINATED";
    photo?: string;
    address: {
        street: string;
        number: string;
        city: string;
        state: string;
        zipCode: string;
        complement?: string;
    };
    documents?: Record<string, string>;
    benefits?: string[];
}

export type UpdateUsersDTO = Partial<CreateUsersDTO>;

export interface UsersBackend {
    id: string;
    name: string;
    email: string;
    cpf: string;
    birthDate: string;
    hireDate: string;
    terminationDate?: string;
    position: "ADMIN" | "COMERCIAL" | "LOGISTICS" | "DRIVER";
    salary: number;
    phone: string;
    contractType: "CLT" | "PJ" | "TEMPORARY" | "INTERNSHIP";
    status: "ACTIVE" | "ON_LEAVE" | "ABSENT" | "TERMINATED";
    photo?: string;
    address: {
        street: string;
        number: string;
        city: string;
        state: string;
        zipCode: string;
        complement?: string;
    };
    user?: {
        id: string;
        name: string;
    };
    documents?: Record<string, unknown>;
    benefits?: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

function mapBackendToFrontend(user: UsersBackend): Usuario {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        birthDate: toDateOnly(user.birthDate),
        hireDate: toDateOnly(user.hireDate),
        terminationDate: toDateOnly(user.terminationDate),
        position: user.position,
        salary: user.salary,
        contractType: user.contractType,
        status: user.status,
        address: user.address,
        documents: user.documents as { rg?: string | undefined; wordPassport?: string | undefined; voterCard?: string | undefined; },
        benefits: user.benefits,
        photo: user.photo,
        user: user.user ? {
            id: user.user.id,
            name: user.user.name,
        } : undefined,
    }
}

// Interface para o usuário motorista
export interface DriverUser {
    id: string;
    name: string;
    email: string;
    role: "DRIVER";
}

function mapDriverBackendToFrontend(user: DriverUser): DriverUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

export class UsersService {
    async getAll(): Promise<{
        success: boolean;
        data?: Usuario[];
        error?: string;
    }> {
        try {
            const result = await api.get<
                UsersBackend[] | { data: UsersBackend[] }
            >("/hr/users");

            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const UsersBackend = raw as UsersBackend[];
                const users = UsersBackend.map(mapBackendToFrontend);
                return { success: true, data: users };
            }
            return { success: false, error: "Erro ao buscar funcionários" };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAllDrivers(): Promise<{
        success: boolean;
        data?: { data: DriverUser[] };
        error?: string;
    }> {
        try {
            const result = await api.get<DriverUser[]>("/hr/users/all-drivers");
            if (result.success && result.data) {
                let dataArray: DriverUser[] = [];

                if (Array.isArray(result.data)) {
                    dataArray = result.data;
                } else if (result.data && typeof result.data === "object") {
                    dataArray = (result.data as any).data || [];
                }

                const userMapeados = dataArray.map(mapDriverBackendToFrontend);

                return {
                    success: true,
                    data: { data: userMapeados },
                };
            } else {
                return {
                    success: false,
                    error: result.error || "Erro ao buscar todos os motoristas",
                };
            }
        } catch (error) {
            console.error("Erro ao buscar todos os motoristas:", error);
            return {
                success: false,
                error: "Erro ao buscar todos os motoristas",
            };
        }
    }

    async create(data: Usuario): Promise<{ success: boolean; data?: Usuario; error?: string }> {
        try {
            const result = await api.post<Usuario | { data: Usuario }>("/hr/users", data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const usersBackend = raw as UsersBackend;
                const users = mapBackendToFrontend(usersBackend);
                return { success: true, data: users };
            }
            return { success: false, error: "Erro ao criar funcionário" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async update(id: string, data: UpdateUsersDTO): Promise<{ success: boolean; data?: Usuario; error?: string }> {
        try {
            const result = await api.patch<UsersBackend | { data: UsersBackend }>(`/hr/users/${id}`, data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const usersBackend = raw as UsersBackend;
                const users = mapBackendToFrontend(usersBackend);
                return { success: true, data: users };
            }
            return { success: false, error: "Erro ao atualizar funcionário" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await api.delete<UsersBackend | { data: UsersBackend }>(`/hr/users/${id}`);
            if (result.success && result.data) {
                return { success: true };
            }
            return { success: false, error: "Erro ao deletar funcionário" };
        }
        catch (error) {
            return { success: false, error: error.message };
        }

    }
}

export const usersService = new UsersService();