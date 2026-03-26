import type { OrdemServicoMotorista } from "../../types";

export interface OrdemServicoFormProps {
  appointmentId: string;
  agendamento: any;
  onClose: () => void;
  onSave?: (ordem: OrdemServicoMotorista) => void;
  onAgendamentosAtualizados?: () => void | Promise<void>;
  embedded?: boolean;
  existingOrdem?: OrdemServicoMotorista;
}

export interface Caixa {
  id: string;
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
