import { api } from "./api.service";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "DRIVER";
}

function mapBackendToFrontend(user: User): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export class UserService {
  async buscarTodosMotoristas(): Promise<{
    success: boolean;
    data?: { data: User[] };
    error?: string;
  }> {
    try {
      const result = await api.get<User[]>("/users/all-drivers");
      if (result.success && result.data) {
        let dataArray: User[] = [];

        if (Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (result.data && typeof result.data === "object") {
          dataArray = (result.data as any).data || [];
        }

        const userMapeados = dataArray.map(mapBackendToFrontend);

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
}

export const userService = new UserService();
