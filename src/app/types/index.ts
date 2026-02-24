export interface Cliente {
  id: string;
  // Dados pessoais USA
  nome: string;
  cpf: string;
  telefoneUSA: string;
  enderecoUSA: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
    zipCode: string;
    complemento?: string;
  };
  // Dados destino Brasil
  destinoBrasil: {
    nomeRecebedor: string;
    cpfRecebedor: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    telefones: string[];
  };
  atendente: string;
  dataCadastro: string;
  status: "ativo" | "inativo";
}

export interface CaixaTamanho {
  id: string;
  nome: string;
  pesoMaximo: number; // kg
  preco: number;
}

export interface Estoque {
  caixasPequenas: number;
  caixasMedias: number;
  caixasGrandes: number;
  fitasAdesivas: number;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  dataColeta: string;
  horaColeta: string;
  endereco: string;
  status: "pendente" | "confirmado" | "coletado" | "cancelado";
  observacoes?: string;
  atendente: string;
}

export interface ItemEnvio {
  id: string;
  caixaTamanho: string;
  peso: number;
  descricao: string;
  itensAdicionais: string[];
}

export interface Container {
  id: string;
  numero: string;
  tipo?: "20ft" | "40ft" | "40ft HC" | "45ft HC";
  origem?: string;
  destino?: string;
  dataEnvio: string;
  dataEmbarque?: string;
  previsaoChegada?: string;
  status:
    | "preparando"
    | "enviado"
    | "em-transito"
    | "entregue"
    | "preparacao"
    | "transito"
    | "entregue"
    | "cancelado";
  volume?: number;
  linkRastreamento?: string;
  caixas: {
    clienteId: string;
    clienteNome: string;
    numeroCaixa: string;
    tamanho: string;
    peso: number;
  }[];
  pesoTotal: number;
  limiteP: number;
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
  tipo: "caixa" | "fita";
  nome: string;
  tamanho?: string; // Para caixas: Pequena, Média, Grande
  dimensoes?: string; // ex: "40x30x25cm"
  pesoMaximo?: number; // kg - para caixas
  unidade: string; // ex: "unidade", "rolo", "pacote"
  precoCusto: number;
  precoVenda: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  precoVariavel?: boolean;
}

export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  dataAdmissao: string;
  dataDemissao?: string;
  cargo: string;
  departamento: string;
  salario: number;
  tipoContrato: "CLT" | "PJ" | "Temporário" | "Estágio";
  status: "ativo" | "férias" | "afastado" | "demitido";
  endereco: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento?: string;
  };
  documentos: {
    rg?: string;
    carteiraTrabalho?: string;
    tituloEleitor?: string;
  };
  beneficios: string[];
  supervisor?: string;
  foto?: string;
}

export interface RegistroPonto {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  data: string;
  entrada: string;
  saidaAlmoco?: string;
  voltaAlmoco?: string;
  saida?: string;
  horasTrabalhadas: number;
  horasExtras: number;
  tipo: "normal" | "falta" | "atestado" | "folga";
  observacoes?: string;
}

export interface Folha {
  id: string;
  mesReferencia: string; // MM/YYYY
  funcionarioId: string;
  funcionarioNome: string;
  salarioBase: number;
  horasExtras: number;
  bonificacoes: number;
  descontos: number;
  inss: number;
  fgts: number;
  salarioLiquido: number;
  dataPagamento: string;
  status: "pendente" | "pago" | "atrasado";
}

export interface Ferias {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  periodoAquisitivo: string;
  dataInicio: string;
  dataFim: string;
  diasCorridos: number;
  status:
    | "solicitado"
    | "aprovado"
    | "em-andamento"
    | "concluído"
    | "cancelado";
  observacoes?: string;
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
    nome: string;
    endereco: string;
    cidade: string;
    estado: string;
    zipCode: string;
    telefone: string;
    cpfRg?: string;
  };

  // Dados do Destinatário (Brasil)
  destinatario: {
    nome: string;
    cpfRg: string;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
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
