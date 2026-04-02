export interface DriverServiceOrder {
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
  container?: {
    id: string | null;
    number: string | null;
    type: string | null;
  };
  driverServiceOrderProducts: {
    id?: string;
    /** Número da caixa na ordem (referência operacional). */
    number?: string;
    /** Etiqueta no container após vínculo (ex.: 3-A). Vem de `containerProduct.boxNumber`. */
    containerBoxNumber?: string | null;
    productId?: string;
    /**
     * Rótulo para exibição (ex.: nome + tipo amigável), montado a partir de `product` na resposta da API.
     * Não é mais persistido na tabela da OS.
     */
    type: string;
    /** `ProductPrice.type` quando a API inclui a relação `product`. */
    productType?: "SMALL_BOX" | "MEDIUM_BOX" | "LARGE_BOX" | "PERSONALIZED_ITEM" | "TAPE_ADHESIVE";
    product?: {
      id: string;
      type: "SMALL_BOX" | "MEDIUM_BOX" | "LARGE_BOX" | "PERSONALIZED_ITEM" | "TAPE_ADHESIVE";
      name: string;
      dimensions?: string | null;
    };
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
  /** URL no MinIO ou, no envio intermediário, pode estar ausente na criação em duas etapas. */
  clientSignature?: string;
  agentSignature?: string;
  signatureDate: string;
  /** Preenchido a partir da relação `driver` na resposta da API. */
  driverName?: string;
  /** CUID do motorista (`DriverServiceOrder.driverId`). Envio opcional na criação (gestão); omitido na resposta transformada se vier só `driver`. */
  driverId?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  chargedValue: number;
  observations?: string;
  deletedDriverServiceOrderProductIds?: string[];
}

export interface DriverServiceOrderFormProps {
  appointmentId: string;
  agendamento: any;
  onClose: () => void;
  onSave?: (ordem: DriverServiceOrder) => void;
  onAgendamentosAtualizados?: () => void | Promise<void>;
  embedded?: boolean;
  existingOrdem?: DriverServiceOrder;
}

export interface Caixa {
  id: string;
  productId?: string;
  type: string;
  number: string;
  value: number;
  weight: number;
}

export interface Item {
  id: string;
  caixaId: string;
  name: string;
  quantity: number;
  weight: number;
  observations?: string;
}

export interface AgendamentoConfirmedBackend {
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
  user: { id: string; name: string };
  client: {
    id: string;
    usaName: string;
    usaCpf: string;
    usaPhone: string;
    usaAddress: {
      rua: string;
      numero: string;
      cidade: string;
      estado: string;
      zipCode: string;
      complemento: string;
    };
    brazilAddress: {
      rua: string;
      bairro: string;
      numero: string;
      cidade: string;
      estado: string;
      cep: string;
      complemento: string;
    };
    brazilName: string;
    brazilCpf: string;
    brazilPhone: string;
  };
  company: { address: string; contactPhone: string };
  serviceOrder: { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' };
  status: 'PENDING' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED';
}
