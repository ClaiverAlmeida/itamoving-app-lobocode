export interface Cliente {
  id: string;
  // Dados pessoais USA
  usaNome: string;
  usaCpf: string;
  usaPhone: string;
  usaAddress: Record<string, unknown>;
  // Dados pessoais Brasil
  brazilNome: string;
  brazilCpf: string;
  brazilPhone: string;
  brazilAddress: Record<string, unknown>;

  /** Atendente: id e nome vêm do backend (relação user). No cadastro usa-se o usuário logado. */
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
  pesoMaximo: number; // kg
  preco: number;
}

export interface Estoque {
  smallBoxes: number;
  mediumBoxes: number;
  largeBoxes: number;
  personalizedItems: number;
  adhesiveTape: number;
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
  address: string;
  observations?: string;
  user: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name: string;
  };
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
  weightLimit: number;
  trackingLink?: string;
  status: "PREPARATION" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
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
  deliveryDeadline: number; // dias
  active: boolean;
}

export interface PrecoProduto {
  id: string;
  type:
  | "SMALL_BOX"
  | "MEDIUM_BOX"
  | "LARGE_BOX"
  | "PERSONALIZED_ITEM"
  | "TAPE_ADHESIVE";
  name: string;
  size?: string; // Para caixas: Pequena, Média, Grande
  dimensions?: string | null; // ex: "40x30x25cm"; null quando tipo Fita
  maxWeight?: number | null; // kg - para caixas; null quando tipo Fita
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

export interface Avaliacao {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  avaliador: string;
  data: string;
  periodo: string;
  criterios: {
    nome: string;
    nota: number; // 1-5
  }[];
  notaFinal: number;
  pontosFortres: string[];
  pontosDesenvolvimento: string[];
  metasProximoPeriodo: string[];
  observacoes?: string;
}

export interface OrdemServicoMotorista {
  id: string;
  agendamentoId: string;

  // Dados do Remetente (USA)
  remetente: {
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

  // Dados do Destinatário (Brasil)
  destinatario: {
    brazilName: string;
    brazilCpf: string;
    brazilAddress: {
      endereco: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };
    brazilPhone: string;
  };

  // Caixas e Valores
  caixas: {
    id: string;
    tipo: string; // tipo da caixa
    numero: string;
    valor: number;
  }[];

  // Assinaturas e Data
  assinaturaCliente?: string;
  assinaturaAgente?: string;
  dataAssinatura: string;

  // Motorista e Status
  motoristaNome: string;
  motoristaId: string;
  status: "pendente" | "em_andamento" | "concluida";
  valorCobrado?: number;

  // Observações
  observacoes?: string;
}
