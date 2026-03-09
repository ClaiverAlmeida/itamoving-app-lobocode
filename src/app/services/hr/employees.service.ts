import { api } from "../api.service";
import { Funcionario } from "../../types";
import { toDateOnly } from "../../utils";

export interface CreateEmployeesDTO {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    hireDate: string;
    terminationDate?: string;
    position: string;
    department: string;
    salary: number;
    contractType: "CLT" | "PJ" | "TEMPORARY" | "INTERNSHIP";
    supervisor: string;
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

export type UpdateEmployeesDTO = Partial<CreateEmployeesDTO>;

export interface EmployeesBackend {
    id: string;
    name: string;
    email: string;
    cpf: string;
    birthDate: string;
    hireDate: string;
    terminationDate?: string;
    position: string;
    department: string;
    salary: number;
    phone: string;
    contractType: "CLT" | "PJ" | "TEMPORARY" | "INTERNSHIP";
    status: "ACTIVE" | "ON_LEAVE" | "ABSENT" | "TERMINATED";
    photo?: string;
    supervisor: string;
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

function mapBackendToFrontend(employee: EmployeesBackend): Funcionario {
    return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        cpf: employee.cpf,
        birthDate: toDateOnly(employee.birthDate),
        hireDate: toDateOnly(employee.hireDate),
        terminationDate: toDateOnly(employee.terminationDate),
        position: employee.position,
        department: employee.department,
        salary: employee.salary,
        contractType: employee.contractType,
        status: employee.status,
        address: employee.address,
        documents: employee.documents as { rg?: string | undefined; wordPassport?: string | undefined; voterCard?: string | undefined; },
        benefits: employee.benefits,
        supervisor: employee.supervisor,
        photo: employee.photo,
        user: employee.user ? {
            id: employee.user.id,
            name: employee.user.name,
        } : undefined,
    }
}

export class EmployeesService {
    async getAll(): Promise<{
        success: boolean;
        data?: Funcionario[];
        error?: string;
    }> {
        try {
            const result = await api.get<
                EmployeesBackend[] | { data: EmployeesBackend[] }
            >("/hr/employees");

            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const employeesBackend = raw as EmployeesBackend[];
                const employees = employeesBackend.map(mapBackendToFrontend);
                return { success: true, data: employees };
            }
            return { success: false, error: "Erro ao buscar funcionários" };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }

    async create(data: Funcionario): Promise<{ success: boolean; data?: Funcionario; error?: string }> {
        try {
            const result = await api.post<Funcionario | { data: Funcionario }>("/hr/employees", data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const employeeBackend = raw as EmployeesBackend;
                const employee = mapBackendToFrontend(employeeBackend);
                return { success: true, data: employee };
            }
            return { success: false, error: "Erro ao criar funcionário" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async update(id: string, data: UpdateEmployeesDTO): Promise<{ success: boolean; data?: Funcionario; error?: string }> {
        try {
            const result = await api.patch<EmployeesBackend | { data: EmployeesBackend }>(`/hr/employees/${id}`, data);
            if (result.success && result.data) {
                const raw = (result.data as any)?.data ?? result.data;
                const employeeBackend = raw as EmployeesBackend;
                const employee = mapBackendToFrontend(employeeBackend);
                return { success: true, data: employee };
            }
            return { success: false, error: "Erro ao atualizar funcionário" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await api.delete<EmployeesBackend | { data: EmployeesBackend }>(`/hr/employees/${id}`);
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

export const employeesService = new EmployeesService();