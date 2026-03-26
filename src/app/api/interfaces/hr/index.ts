export interface CreateUsersDTO {
  name: string;
  email: string;
  login: string;
  password: string;
  role: 'ADMIN' | 'COMERCIAL' | 'LOGISTICS' | 'DRIVER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ON_LEAVE' | 'TERMINATED';
  phone?: string;
  cpf?: string;
  rg?: string;
  profilePicture?: string;
  birthDate?: string;
  hireDate?: string;
  terminationDate?: string;
  salary?: number;
  address?: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
  };
  documents?: Record<string, unknown>;
  benefits?: string[];
}

export interface UsersBackend {
  id: string;
  name: string;
  email: string;
  login: string;
  cpf?: string | null;
  rg?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  hireDate?: string | null;
  terminationDate?: string | null;
  salary?: number | null;
  role: 'ADMIN' | 'COMERCIAL' | 'LOGISTICS' | 'DRIVER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ON_LEAVE' | 'TERMINATED';
  profilePicture?: string | null;
  address?: Record<string, unknown> | null;
  documents?: Record<string, unknown> | null;
  benefits?: string[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: 'DRIVER';
}
