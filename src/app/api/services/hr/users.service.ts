import { Usuario } from "../../types";
import { toDateOnly } from "../../../utils";
import { BaseCrudService } from "../base-crud.service";
import type {
    CreateUsersDTO,
    DriverUser,
    UpdateUsersDTO,
    UsersBackend,
} from "../../types";

function mapBackendToFrontend(user: UsersBackend): Usuario {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        login: user.login,
        phone: user.phone ?? undefined,
        cpf: user.cpf ?? undefined,
        birthDate: user.birthDate ? toDateOnly(user.birthDate) : undefined,
        hireDate: user.hireDate ? toDateOnly(user.hireDate) : undefined,
        terminationDate: user.terminationDate ? toDateOnly(user.terminationDate) : undefined,
        salary: user.salary ?? undefined,
        status: user.status,
        rg: user.rg ?? undefined,
        profilePicture: user.profilePicture ?? undefined,
        address: user.address as Usuario["address"] ?? undefined,
        documents: user.documents ?? undefined,
        benefits: user.benefits ?? undefined,
        role: user.role,
    };
}

function mapDriverBackendToFrontend(user: DriverUser): DriverUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

class UsersDriversCrudService extends BaseCrudService<
    DriverUser,
    DriverUser,
    never,
    never
> {
    constructor() {
        super("/hr/users/drivers", mapDriverBackendToFrontend, {
            listError: "Erro ao buscar todos os motoristas",
        });
    }
}

export class UsersService extends BaseCrudService<
    Usuario,
    UsersBackend,
    CreateUsersDTO,
    UpdateUsersDTO
> {
    private readonly driversService = new UsersDriversCrudService();

    constructor() {
        super("/hr/users", mapBackendToFrontend, {
            listError: "Erro ao buscar funcionários",
            createError: "Erro ao criar funcionário",
            updateError: "Erro ao atualizar funcionário",
            deleteError: "Erro ao deletar funcionário",
        });
    }

    async getAllDrivers(): Promise<{
        success: boolean;
        data?: DriverUser[];
        error?: string;
    }> {
        return this.driversService.getAll();
    }

}

export const usersService = new UsersService();