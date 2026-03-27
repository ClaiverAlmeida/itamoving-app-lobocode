export interface Cliente {
  id: string;
  usaNome: string;
  usaCpf: string;
  usaPhone: string;
  usaAddress: Record<string, unknown>;
  brazilNome: string;
  brazilCpf: string;
  brazilPhone: string;
  brazilAddress: Record<string, unknown>;
  user?: {
    id: string;
    name: string;
  };
  dataCadastro: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "DRIVER";
}

export interface CaixaTamanho {
  id: string;
  nome: string;
  pesoMaximo: number;
  preco: number;
}

export interface Agendamento {
  id?: string;
  appointmentPeriodId?: string;
  collectionDate?: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic?: boolean | false;
  qtyBoxes: number;
  observations?: string;
  user: { id: string; name: string };
  client: { id: string; name: string; usaAddress: string };
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
}

export interface ItemEnvio {
  id: string;
  caixaTamanho: string;
  peso: number;
  descricao: string;
  itensAdicionais: string[];
}

export interface Container {
  id?: string;
  number: string;
  type?: string;
  seal?: string;
  origin?: string;
  destination?: string;
  shipmentDate?: string;
  boardingDate?: string;
  estimatedArrival?: string;
  volume?: number;
  /** Peso do container vazio — tara (kg). */
  emptyWeight?: number | null;
  /** Peso do container cheio — bruto (kg); limite de peso da carga. */
  fullWeight?: number | null;
  trackingLink?: string;
  status: "PREPARATION" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  /** Letra do volume (ex.: A, B) — numeração 1-A, 2-A… (gravada após a primeira ordem com caixas). */
  volumeLetter?: string;
  /** Limite alvo de volumes por container (padrão ~220). */
  volumeCapacity?: number;
  /** Quantidade de ordens de serviço já vinculadas a este container. */
  linkedServiceOrderCount?: number;
  boxes?: {
    clientId: string;
    clientName: string;
    boxNumber: string;
    size: string;
    weight: number;
  }[];
  totalWeight?: number;
}

export interface Transacao {
  id: string;
  clienteId: string;
  clienteNome: string;
  tipo: "receita" | "despesa";
  categoria: string;
  valor: number;
  data: string;
  descricao: string;
  metodoPagamento: string;
}

export interface Rota {
  id: string;
  data: string;
  agendamentos: Agendamento[];
  rotaOtimizada: string[];
  distanciaTotal: number;
  tempoEstimado: number;
}

export interface PrecoEntrega {
  id: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pricePerKg: number;
  minimumPrice: number;
  deliveryDeadline: number;
  active: boolean;
}

export interface PrecoProduto {
  id: string;
  type: "SMALL_BOX" | "MEDIUM_BOX" | "LARGE_BOX" | "PERSONALIZED_ITEM" | "TAPE_ADHESIVE";
  name: string;
  size?: string;
  dimensions?: string | null;
  maxWeight?: number | null;
  costPrice: number;
  salePrice: number;
  active: boolean;
  variablePrice?: boolean;
}

export interface Usuario {
  id?: string;
  name: string;
  email: string;
  login?: string;
  password?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  hireDate?: string;
  terminationDate?: string;
  role: "ADMIN" | "COMERCIAL" | "LOGISTICS" | "DRIVER";
  salary?: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "ON_LEAVE" | "TERMINATED";
  rg?: string;
  profilePicture?: string;
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

export interface OrdemServicoMotorista {
  id?: string;
  appointmentId: string;
  sender: {
    usaName: string;
    usaAddress: {
      rua: string;
      numero: string;
      cidade: string;
      estado: string;
      zipCode: string;
      complemento?: string;
    };
    usaPhone: string;
    usaCpf: string;
  };
  recipient: {
    brazilName: string;
    brazilCpf: string;
    brazilAddress: {
      rua: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
      complemento?: string;
      numero?: string;
    };
    brazilPhone: string;
  };
  driverServiceOrderProducts: {
    id?: string;
    /** Número da caixa na ordem (referência operacional). */
    number?: string;
    productId?: string;
    type: string;
    weight: number;
    value: number;
    driverServiceOrderProductsItems?: {
      id?: string;
      driverServiceOrderId?: string;
      name: string;
      quantity: number;
      weight: number;
      observations?: string;
    }[];
  }[];
  clientSignature: string;
  agentSignature: string;
  signatureDate: string;
  driverName: string;
  userId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  chargedValue: number;
  observations?: string;
  deletedDriverServiceOrderProductIds?: string[];
}
