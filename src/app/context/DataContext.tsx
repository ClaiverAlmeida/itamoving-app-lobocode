import { createContext, useContext, useState, ReactNode } from 'react';
import { Cliente, Estoque, Agendamento, Container, Transacao, Rota, PrecoEntrega, PrecoProduto, Funcionario, RegistroPonto, Folha, Ferias, OrdemServicoMotorista } from '../types';

interface DataContextType {
  clientes: Cliente[];
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  estoque: Estoque;
  updateEstoque: (estoque: Partial<Estoque>) => void;
  
  agendamentos: Agendamento[];
  setAgendamentos: (agendamentos: Agendamento[]) => void;
  addAgendamento: (agendamento: Agendamento) => void;
  updateAgendamento: (id: string, agendamento: Partial<Agendamento>) => void;
  deleteAgendamento: (id: string) => void;
  
  containers: Container[];
  setContainers: (containers: Container[]) => void;
  addContainer: (container: Container) => void;
  updateContainer: (id: string, container: Partial<Container>) => void;
  deleteContainer: (id: string) => void;
  
  transacoes: Transacao[];
  setTransacoes: (transacoes: Transacao[]) => void;
  addTransacao: (transacao: Transacao) => void;
  deleteTransacao: (id: string) => void;
  
  rotas: Rota[];
  setRotas: (rotas: Rota[]) => void;
  
  precosEntrega: PrecoEntrega[];
  setPrecosEntrega: (precos: PrecoEntrega[]) => void;
  addPrecoEntrega: (preco: PrecoEntrega) => void;
  updatePrecoEntrega: (id: string, preco: Partial<PrecoEntrega>) => void;
  deletePrecoEntrega: (id: string) => void;
  
  precosProdutos: PrecoProduto[];
  setPrecosProdutos: (produtos: PrecoProduto[]) => void;
  addPrecoProduto: (produto: PrecoProduto) => void;
  updatePrecoProduto: (id: string, produto: Partial<PrecoProduto>) => void;
  deletePrecoProduto: (id: string) => void;
  
  funcionarios: Funcionario[];
  setFuncionarios: (funcionarios: Funcionario[]) => void;
  addFuncionario: (funcionario: Funcionario) => void;
  updateFuncionario: (id: string, funcionario: Partial<Funcionario>) => void;
  deleteFuncionario: (id: string) => void;
  
  registrosPonto: RegistroPonto[];
  setRegistrosPonto: (registros: RegistroPonto[]) => void;
  addRegistroPonto: (registro: RegistroPonto) => void;
  
  folhasPagamento: Folha[];
  setFolhasPagamento: (folhas: Folha[]) => void;
  addFolhaPagamento: (folha: Folha) => void;
  
  ferias: Ferias[];
  setFerias: (ferias: Ferias[]) => void;
  addFerias: (ferias: Ferias) => void;
  updateFerias: (id: string, ferias: Partial<Ferias>) => void;
  
  ordensServicoMotorista: OrdemServicoMotorista[];
  setOrdensServicoMotorista: (ordens: OrdemServicoMotorista[]) => void;
  addOrdemServicoMotorista: (ordem: OrdemServicoMotorista) => void;
  updateOrdemServicoMotorista: (id: string, ordem: Partial<OrdemServicoMotorista>) => void;
  deleteOrdemServicoMotorista: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const agendamentosIniciais: Agendamento[] = [
  {
    id: '1',
    clienteId: '1',
    clienteNome: 'João Silva',
    dataColeta: '2024-12-28',
    horaColeta: '14:00',
    endereco: '123 Main Street, Miami, FL 33101',
    status: 'confirmado',
    observacoes: 'Portão azul',
    atendente: 'Ana Paula',
  },
  {
    id: '2',
    clienteId: '2',
    clienteNome: 'Carlos Mendes',
    dataColeta: '2024-12-28',
    horaColeta: '16:00',
    endereco: '456 Oak Avenue, Orlando, FL 32801',
    status: 'pendente',
    atendente: 'Lucas Santos',
  },
];

const containersIniciais: Container[] = [
  {
    id: '1',
    numero: 'CNT-2024-001',
    tipo: '40ft',
    origem: 'Miami, FL',
    destino: 'Santos, SP',
    dataEnvio: '2025-01-15',
    dataEmbarque: '2025-01-10',
    previsaoChegada: '2025-02-05',
    status: 'preparando',
    volume: 67.5,
    caixas: [
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-001',
        tamanho: 'Grande',
        peso: 25,
      },
    ],
    pesoTotal: 25,
    limiteP: 5000,
  },
  {
    id: '2',
    numero: 'CNT-2024-002',
    tipo: '40ft HC',
    origem: 'Orlando, FL',
    destino: 'Rio de Janeiro, RJ',
    dataEnvio: '2025-01-08',
    dataEmbarque: '2025-01-05',
    previsaoChegada: '2025-01-28',
    status: 'transito',
    volume: 75.8,
    linkRastreamento: 'https://www.track-trace.com/container/CNT2024002',
    caixas: [
      {
        clienteId: '2',
        clienteNome: 'Carlos Mendes',
        numeroCaixa: 'CX-002',
        tamanho: 'Grande',
        peso: 30,
      },
      {
        clienteId: '2',
        clienteNome: 'Carlos Mendes',
        numeroCaixa: 'CX-003',
        tamanho: 'Média',
        peso: 18,
      },
    ],
    pesoTotal: 48,
    limiteP: 5500,
  },
  {
    id: '3',
    numero: 'CNT-2024-003',
    tipo: '20ft',
    origem: 'Tampa, FL',
    destino: 'São Paulo, SP',
    dataEnvio: '2024-12-10',
    dataEmbarque: '2024-12-08',
    previsaoChegada: '2024-12-28',
    status: 'entregue',
    volume: 33.2,
    caixas: [
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-004',
        tamanho: 'Média',
        peso: 15,
      },
    ],
    pesoTotal: 15,
    limiteP: 3000,
  },
  {
    id: '4',
    numero: 'CNT-2024-004',
    tipo: '45ft HC',
    origem: 'Fort Lauderdale, FL',
    destino: 'Recife, PE',
    dataEnvio: '2025-01-20',
    dataEmbarque: '2025-01-18',
    previsaoChegada: '2025-02-12',
    status: 'preparacao',
    volume: 86.0,
    caixas: [
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-005',
        tamanho: 'Grande',
        peso: 28,
      },
      {
        clienteId: '2',
        clienteNome: 'Carlos Mendes',
        numeroCaixa: 'CX-006',
        tamanho: 'Grande',
        peso: 32,
      },
    ],
    pesoTotal: 60,
    limiteP: 6000,
  },
  {
    id: '5',
    numero: 'CNT-2024-005',
    tipo: '40ft',
    origem: 'Jacksonville, FL',
    destino: 'Salvador, BA',
    dataEnvio: '2025-01-12',
    dataEmbarque: '2025-01-10',
    previsaoChegada: '2025-02-02',
    status: 'transito',
    volume: 68.4,
    linkRastreamento: 'https://www.marinetraffic.com/track/CNT2024005',
    caixas: [
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-007',
        tamanho: 'Pequena',
        peso: 8,
      },
      {
        clienteId: '2',
        clienteNome: 'Carlos Mendes',
        numeroCaixa: 'CX-008',
        tamanho: 'Média',
        peso: 20,
      },
    ],
    pesoTotal: 28,
    limiteP: 5000,
  },
  {
    id: '6',
    numero: 'CNT-2023-086',
    tipo: '40ft',
    origem: 'Miami, FL',
    destino: 'Fortaleza, CE',
    dataEnvio: '2024-11-15',
    dataEmbarque: '2024-11-12',
    previsaoChegada: '2024-12-08',
    status: 'entregue',
    volume: 70.2,
    caixas: [
      {
        clienteId: '2',
        clienteNome: 'Carlos Mendes',
        numeroCaixa: 'CX-009',
        tamanho: 'Grande',
        peso: 35,
      },
    ],
    pesoTotal: 35,
    limiteP: 5000,
  },
  {
    id: '7',
    numero: 'CNT-2024-007',
    tipo: '20ft',
    origem: 'West Palm Beach, FL',
    destino: 'Curitiba, PR',
    dataEnvio: '2025-01-05',
    dataEmbarque: '2025-01-03',
    previsaoChegada: '2025-01-25',
    status: 'transito',
    volume: 32.6,
    linkRastreamento: 'https://www.searates.com/container/tracking/CNT2024007',
    caixas: [
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-010',
        tamanho: 'Média',
        peso: 16,
      },
    ],
    pesoTotal: 16,
    limiteP: 3000,
  },
  {
    id: '8',
    numero: 'CNT-2024-008',
    tipo: '40ft HC',
    origem: 'Port St. Lucie, FL',
    destino: 'Brasília, DF',
    dataEnvio: '2024-12-20',
    dataEmbarque: '2024-12-18',
    previsaoChegada: '2025-01-10',
    status: 'cancelado',
    volume: 0,
    caixas: [],
    pesoTotal: 0,
    limiteP: 5500,
  },
  {
    id: '9',
    numero: 'CNT-2024-009',
    tipo: '45ft HC',
    origem: 'Boca Raton, FL',
    destino: 'Porto Alegre, RS',
    dataEnvio: '2025-01-25',
    dataEmbarque: '2025-01-22',
    previsaoChegada: '2025-02-18',
    status: 'preparacao',
    volume: 84.5,
    caixas: [
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-011',
        tamanho: 'Grande',
        peso: 29,
      },
      {
        clienteId: '2',
        clienteNome: 'Carlos Mendes',
        numeroCaixa: 'CX-012',
        tamanho: 'Grande',
        peso: 31,
      },
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-013',
        tamanho: 'Média',
        peso: 19,
      },
    ],
    pesoTotal: 79,
    limiteP: 6000,
  },
  {
    id: '10',
    numero: 'CNT-2023-092',
    tipo: '40ft',
    origem: 'Deerfield Beach, FL',
    destino: 'Belo Horizonte, MG',
    dataEnvio: '2024-12-01',
    dataEmbarque: '2024-11-28',
    previsaoChegada: '2024-12-20',
    status: 'entregue',
    volume: 69.8,
    caixas: [
      {
        clienteId: '2',
        clienteNome: 'Carlos Mendes',
        numeroCaixa: 'CX-014',
        tamanho: 'Grande',
        peso: 27,
      },
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-015',
        tamanho: 'Pequena',
        peso: 12,
      },
    ],
    pesoTotal: 39,
    limiteP: 5000,
  },
  {
    id: '11',
    numero: 'CNT-2024-011',
    tipo: '40ft',
    origem: 'Pompano Beach, FL',
    destino: 'Manaus, AM',
    dataEnvio: '2025-01-18',
    dataEmbarque: '2025-01-15',
    previsaoChegada: '2025-02-10',
    status: 'transito',
    volume: 71.3,
    caixas: [
      {
        clienteId: '1',
        clienteNome: 'João Silva',
        numeroCaixa: 'CX-016',
        tamanho: 'Grande',
        peso: 26,
      },
    ],
    pesoTotal: 26,
    limiteP: 5000,
  },
  {
    id: '12',
    numero: 'CNT-2024-012',
    tipo: '20ft',
    origem: 'Delray Beach, FL',
    destino: 'Belém, PA',
    dataEnvio: '2024-12-28',
    dataEmbarque: '2024-12-22',
    previsaoChegada: '2025-01-05',
    status: 'cancelado',
    volume: 0,
    caixas: [],
    pesoTotal: 0,
    limiteP: 3000,
  },
];

const transacoesIniciais: Transacao[] = [
  {
    id: '1',
    clienteId: '1',
    clienteNome: 'João Silva',
    tipo: 'receita',
    categoria: 'Serviço de Mudança',
    valor: 850,
    data: '2024-12-15',
    descricao: '2 caixas grandes + fitas',
    metodoPagamento: 'Cartão de Crédito',
  },
  {
    id: '2',
    clienteId: '2',
    clienteNome: 'Carlos Mendes',
    tipo: 'receita',
    categoria: 'Serviço de Mudança',
    valor: 1200,
    data: '2024-12-18',
    descricao: '3 caixas grandes + móveis',
    metodoPagamento: 'Transferência',
  },
];

const precosEntregaIniciais: PrecoEntrega[] = [
  {
    id: '1',
    originCity: 'Miami',
    originState: 'FL',
    destinationCity: 'São Paulo',
    destinationState: 'SP',
    pricePerKg: 8.50,
    minimumPrice: 150.00,
    deliveryDeadline: 30,
    active: true,
  },
  {
    id: '2',
    originCity: 'Orlando',
    originState: 'FL',
    destinationCity: 'Rio de Janeiro',
    destinationState: 'RJ',
    pricePerKg: 9.00,
    minimumPrice: 180.00,
    deliveryDeadline: 28,
    active: true,
  },
  {
    id: '3',
    originCity: 'Tampa',
    originState: 'FL',
    destinationCity: 'Belo Horizonte',
    destinationState: 'MG',
    pricePerKg: 8.75,
    minimumPrice: 160.00,
    deliveryDeadline: 32,
    active: true,
  },
  {
    id: '4',
    originCity: 'Fort Lauderdale',
    originState: 'FL',
    destinationCity: 'Brasília',
    destinationState: 'DF',
    pricePerKg: 10.00,
    minimumPrice: 200.00,
    deliveryDeadline: 35,
    active: false,
  },
];

const precosProdutosIniciais: PrecoProduto[] = [
  {
    id: '1',
    type: 'SMALL_BOX',
    name: 'Caixa Pequena',
    dimensions: '30x25x20cm',
    maxWeight: 10,
    costPrice: 3.50,
    salePrice: 8.00,
    active: true,
  },
  {
    id: '2',
    type: 'MEDIUM_BOX',
    name: 'Caixa Média',
    dimensions: '40x35x30cm',
    maxWeight: 20,
    costPrice: 5.00,
    salePrice: 12.00,
    active: true,
  },
  {
    id: '3',
    type: 'LARGE_BOX',
    name: 'Caixa Grande',
    dimensions: '50x45x40cm',
    maxWeight: 30,
    costPrice: 7.50,
    salePrice: 18.00,
    active: true,
  },
  {
    id: '4',
    type: 'TAPE_ADHESIVE',
    name: 'Fita Adesiva Transparente',
    costPrice: 1.20,
    salePrice: 3.50,
    active: true,
  },
  {
    id: '5',
    type: 'TAPE_ADHESIVE',
    name: 'Fita Adesiva Marrom',
    costPrice: 1.50,
    salePrice: 4.00,
    active: true,
  },
  {
    id: '6',
    type: 'TAPE_ADHESIVE',
    name: 'Fita Adesiva Reforçada',
    costPrice: 2.00,
    salePrice: 5.50,
    active: true,
  },
];

const funcionariosIniciais: Funcionario[] = [
  {
    id: '1',
    nome: 'Roberto Costa',
    email: 'roberto.costa@itamoving.com',
    telefone: '+1 (305) 555-1234',
    cpf: '123.456.789-01',
    dataNascimento: '1985-05-15',
    dataAdmissao: '2020-03-01',
    cargo: 'Motorista',
    departamento: 'Operações',
    salario: 3500.00,
    tipoContrato: 'CLT',
    status: 'ativo',
    endereco: {
      rua: '789 Sunset Blvd',
      numero: '123',
      cidade: 'Miami',
      estado: 'FL',
      cep: '33125',
    },
    documentos: {
      rg: '12.345.678-9',
      carteiraTrabalho: '1234567890',
    },
    beneficios: ['Vale Transporte', 'Vale Refeição'],
    supervisor: 'Ana Paula',
  },
  {
    id: '2',
    nome: 'Ana Paula Oliveira',
    email: 'ana.paula@itamoving.com',
    telefone: '+1 (305) 555-5678',
    cpf: '987.654.321-02',
    dataNascimento: '1990-08-22',
    dataAdmissao: '2019-01-15',
    cargo: 'Gerente',
    departamento: 'Comercial',
    salario: 5500.00,
    tipoContrato: 'CLT',
    status: 'ativo',
    endereco: {
      rua: '456 Ocean Drive',
      numero: '789',
      cidade: 'Miami Beach',
      estado: 'FL',
      cep: '33139',
    },
    documentos: {
      rg: '98.765.432-1',
      carteiraTrabalho: '0987654321',
    },
    beneficios: ['Vale Transporte', 'Vale Refeição', 'Plano de Saúde'],
  },
  {
    id: '3',
    nome: 'Lucas Santos',
    email: 'lucas.santos@itamoving.com',
    telefone: '+1 (305) 555-9012',
    cpf: '456.789.123-03',
    dataNascimento: '1995-12-10',
    dataAdmissao: '2021-06-01',
    cargo: 'Atendente',
    departamento: 'Comercial',
    salario: 2800.00,
    tipoContrato: 'CLT',
    status: 'ativo',
    endereco: {
      rua: '321 Collins Ave',
      numero: '456',
      cidade: 'Miami',
      estado: 'FL',
      cep: '33140',
    },
    documentos: {
      rg: '45.678.912-3',
    },
    beneficios: ['Vale Transporte', 'Vale Refeição'],
    supervisor: 'Ana Paula',
  },
  {
    id: '4',
    nome: 'Mariana Ferreira',
    email: 'mariana.ferreira@itamoving.com',
    telefone: '+1 (305) 555-3456',
    cpf: '789.123.456-04',
    dataNascimento: '1992-03-18',
    dataAdmissao: '2022-09-15',
    cargo: 'Coordenador',
    departamento: 'Logística',
    salario: 4200.00,
    tipoContrato: 'CLT',
    status: 'férias',
    endereco: {
      rua: '654 Washington Ave',
      numero: '321',
      cidade: 'Miami',
      estado: 'FL',
      cep: '33139',
    },
    documentos: {
      rg: '78.912.345-6',
      carteiraTrabalho: '4567891234',
    },
    beneficios: ['Vale Transporte', 'Vale Refeição', 'Plano de Saúde'],
    supervisor: 'Ana Paula',
  },
];

const registrosPontoIniciais: RegistroPonto[] = [
  {
    id: '1',
    funcionarioId: '1',
    funcionarioNome: 'Roberto Costa',
    data: new Date().toISOString().split('T')[0],
    entrada: '08:00',
    saidaAlmoco: '12:00',
    voltaAlmoco: '13:00',
    saida: '17:00',
    horasTrabalhadas: 8.0,
    horasExtras: 0,
    tipo: 'normal',
  },
  {
    id: '2',
    funcionarioId: '2',
    funcionarioNome: 'Ana Paula Oliveira',
    data: new Date().toISOString().split('T')[0],
    entrada: '08:30',
    saidaAlmoco: '12:30',
    voltaAlmoco: '13:30',
    saida: '18:00',
    horasTrabalhadas: 8.0,
    horasExtras: 0,
    tipo: 'normal',
  },
  {
    id: '3',
    funcionarioId: '3',
    funcionarioNome: 'Lucas Santos',
    data: new Date().toISOString().split('T')[0],
    entrada: '09:00',
    saidaAlmoco: '13:00',
    voltaAlmoco: '14:00',
    saida: '19:30',
    horasTrabalhadas: 9.5,
    horasExtras: 1.5,
    tipo: 'normal',
    observacoes: 'Hora extra para finalizar atendimento',
  },
];

const folhasPagamentoIniciais: Folha[] = [
  {
    id: '1',
    mesReferencia: '12/2024',
    funcionarioId: '1',
    funcionarioNome: 'Roberto Costa',
    salarioBase: 3500.00,
    horasExtras: 180.00,
    bonificacoes: 200.00,
    descontos: 150.00,
    inss: 385.00,
    fgts: 280.00,
    salarioLiquido: 3345.00,
    dataPagamento: '2024-12-05',
    status: 'pago',
  },
  {
    id: '2',
    mesReferencia: '12/2024',
    funcionarioId: '2',
    funcionarioNome: 'Ana Paula Oliveira',
    salarioBase: 5500.00,
    horasExtras: 0,
    bonificacoes: 500.00,
    descontos: 200.00,
    inss: 605.00,
    fgts: 440.00,
    salarioLiquido: 5195.00,
    dataPagamento: '2024-12-05',
    status: 'pago',
  },
  {
    id: '3',
    mesReferencia: '12/2024',
    funcionarioId: '3',
    funcionarioNome: 'Lucas Santos',
    salarioBase: 2800.00,
    horasExtras: 120.00,
    bonificacoes: 150.00,
    descontos: 100.00,
    inss: 308.00,
    fgts: 224.00,
    salarioLiquido: 2662.00,
    dataPagamento: '2024-12-05',
    status: 'pago',
  },
];

const feriasIniciais: Ferias[] = [
  {
    id: '1',
    funcionarioId: '4',
    funcionarioNome: 'Mariana Ferreira',
    periodoAquisitivo: '2023/2024',
    dataInicio: '2024-12-20',
    dataFim: '2025-01-03',
    diasCorridos: 15,
    status: 'em-andamento',
    observacoes: 'Férias de fim de ano',
  },
  {
    id: '2',
    funcionarioId: '1',
    funcionarioNome: 'Roberto Costa',
    periodoAquisitivo: '2024/2025',
    dataInicio: '2025-07-01',
    dataFim: '2025-07-30',
    diasCorridos: 30,
    status: 'solicitado',
    observacoes: 'Viagem para o Brasil',
  },
];

const ordensServicoMotoristaIniciais: OrdemServicoMotorista[] = [];

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  const [estoque, setEstoque] = useState<Estoque>({
    smallBoxes: 0,
    mediumBoxes: 0,
    largeBoxes: 0,
    personalizedItems: 0,
    adhesiveTape: 0,
  });
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(agendamentosIniciais);
  const [containers, setContainers] = useState<Container[]>(containersIniciais);
  const [transacoes, setTransacoes] = useState<Transacao[]>(transacoesIniciais);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [precosEntrega, setPrecosEntrega] = useState<PrecoEntrega[]>(precosEntregaIniciais);
  const [precosProdutos, setPrecosProdutos] = useState<PrecoProduto[]>(precosProdutosIniciais);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosIniciais);
  const [registrosPonto, setRegistrosPonto] = useState<RegistroPonto[]>(registrosPontoIniciais);
  const [folhasPagamento, setFolhasPagamento] = useState<Folha[]>(folhasPagamentoIniciais);
  const [ferias, setFerias] = useState<Ferias[]>(feriasIniciais);
  const [ordensServicoMotorista, setOrdensServicoMotorista] = useState<OrdemServicoMotorista[]>(ordensServicoMotoristaIniciais);

  const addCliente = (cliente: Cliente) => {
    setClientes([...clientes, cliente]);
  };

  const updateCliente = (id: string, clienteUpdate: Partial<Cliente>) => {
    setClientes(clientes.map(c => c.id === id ? { ...c, ...clienteUpdate } : c));
  };

  const deleteCliente = (id: string) => {
    setClientes(clientes.filter(c => c.id !== id));
  };

  const updateEstoque = (estoqueUpdate: Partial<Estoque>) => {
    setEstoque({ ...estoque, ...estoqueUpdate });
  };

  const addAgendamento = (agendamento: Agendamento) => {
    setAgendamentos([...agendamentos, agendamento]);
  };

  const updateAgendamento = (id: string, agendamentoUpdate: Partial<Agendamento>) => {
    setAgendamentos(agendamentos.map(a => a.id === id ? { ...a, ...agendamentoUpdate } : a));
  };

  const deleteAgendamento = (id: string) => {
    setAgendamentos(agendamentos.filter(a => a.id !== id));
  };

  const addContainer = (container: Container) => {
    setContainers([...containers, container]);
  };

  const updateContainer = (id: string, containerUpdate: Partial<Container>) => {
    setContainers(containers.map(c => c.id === id ? { ...c, ...containerUpdate } : c));
  };

  const deleteContainer = (id: string) => {
    setContainers(containers.filter(c => c.id !== id));
  };

  const addTransacao = (transacao: Transacao) => {
    setTransacoes([...transacoes, transacao]);
  };

  const deleteTransacao = (id: string) => {
    setTransacoes(transacoes.filter(t => t.id !== id));
  };

  const addPrecoEntrega = (preco: PrecoEntrega) => {
    setPrecosEntrega([...precosEntrega, preco]);
  };

  const updatePrecoEntrega = (id: string, precoUpdate: Partial<PrecoEntrega>) => {
    setPrecosEntrega(precosEntrega.map(p => p.id === id ? { ...p, ...precoUpdate } : p));
  };

  const deletePrecoEntrega = (id: string) => {
    setPrecosEntrega(precosEntrega.filter(p => p.id !== id));
  };

  const addPrecoProduto = (produto: PrecoProduto) => {
    setPrecosProdutos([...precosProdutos, produto]);
  };

  const updatePrecoProduto = (id: string, produtoUpdate: Partial<PrecoProduto>) => {
    setPrecosProdutos(precosProdutos.map(p => p.id === id ? { ...p, ...produtoUpdate } : p));
  };

  const deletePrecoProduto = (id: string) => {
    setPrecosProdutos(precosProdutos.filter(p => p.id !== id));
  };

  const addFuncionario = (funcionario: Funcionario) => {
    setFuncionarios([...funcionarios, funcionario]);
  };

  const updateFuncionario = (id: string, funcionarioUpdate: Partial<Funcionario>) => {
    setFuncionarios(funcionarios.map(f => f.id === id ? { ...f, ...funcionarioUpdate } : f));
  };

  const deleteFuncionario = (id: string) => {
    setFuncionarios(funcionarios.filter(f => f.id !== id));
  };

  const addRegistroPonto = (registro: RegistroPonto) => {
    setRegistrosPonto([...registrosPonto, registro]);
  };

  const addFolhaPagamento = (folha: Folha) => {
    setFolhasPagamento([...folhasPagamento, folha]);
  };

  const addFerias = (ferias: Ferias) => {
    setFerias([...ferias, ferias]);
  };

  const updateFerias = (id: string, feriasUpdate: Partial<Ferias>) => {
    setFerias(ferias.map(f => f.id === id ? { ...f, ...feriasUpdate } : f));
  };

  const addOrdemServicoMotorista = (ordem: OrdemServicoMotorista) => {
    setOrdensServicoMotorista([...ordensServicoMotorista, ordem]);
  };

  const updateOrdemServicoMotorista = (id: string, ordemUpdate: Partial<OrdemServicoMotorista>) => {
    setOrdensServicoMotorista(ordensServicoMotorista.map(o => o.id === id ? { ...o, ...ordemUpdate } : o));
  };

  const deleteOrdemServicoMotorista = (id: string) => {
    setOrdensServicoMotorista(ordensServicoMotorista.filter(o => o.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        clientes,
        setClientes,
        addCliente,
        updateCliente,
        deleteCliente,
        estoque,
        updateEstoque,
        agendamentos,
        setAgendamentos,
        addAgendamento,
        updateAgendamento,
        deleteAgendamento,
        containers,
        setContainers,
        addContainer,
        updateContainer,
        deleteContainer,
        transacoes,
        setTransacoes,
        addTransacao,
        deleteTransacao,
        rotas,
        setRotas,
        precosEntrega,
        setPrecosEntrega,
        addPrecoEntrega,
        updatePrecoEntrega,
        deletePrecoEntrega,
        precosProdutos,
        setPrecosProdutos,
        addPrecoProduto,
        updatePrecoProduto,
        deletePrecoProduto,
        funcionarios,
        setFuncionarios,
        addFuncionario,
        updateFuncionario,
        deleteFuncionario,
        registrosPonto,
        setRegistrosPonto,
        addRegistroPonto,
        folhasPagamento,
        setFolhasPagamento,
        addFolhaPagamento,
        ferias,
        setFerias,
        addFerias,
        updateFerias,
        ordensServicoMotorista,
        setOrdensServicoMotorista,
        addOrdemServicoMotorista,
        updateOrdemServicoMotorista,
        deleteOrdemServicoMotorista,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}