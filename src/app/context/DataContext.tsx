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

const funcionariosIniciais: Funcionario[] = [
  {
    id: '1',
    name: 'Roberto Costa',
    email: 'roberto.costa@itamoving.com',
    phone: '+1 (305) 555-1234',
    cpf: '123.456.789-01',
    birthDate: '1985-05-15',
    hireDate: '2020-03-01',
    position: 'Motorista',
    department: 'Operações',
    salary: 3500.00,
    contractType: 'CLT',
    status: 'ACTIVE',
    address: {
      street: '789 Sunset Blvd',
      number: '123',
      city: 'Miami',
      state: 'FL',
      zipCode: '33125',
    },
    documents: {
      rg: '12.345.678-9',
      wordPassport: '1234567890',
    },
    benefits: ['Vale Transporte', 'Vale Refeição'],
    supervisor: 'Ana Paula',
  },
  {
    id: '2',
    name: 'Ana Paula Oliveira',
    email: 'ana.paula@itamoving.com',
    phone: '+1 (305) 555-5678',
    cpf: '987.654.321-02',
    birthDate: '1990-08-22',
    hireDate: '2019-01-15',
    position: 'Gerente',
    department: 'Comercial',
    salary: 5500.00,
    contractType: 'CLT',
    status: 'ACTIVE',
    address: {
      street: '456 Ocean Drive',
      number: '789',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
    },
    documents: {
      rg: '98.765.432-1',
      wordPassport: '0987654321',
    },
    benefits: ['Vale Transporte', 'Vale Refeição', 'Plano de Saúde'],
  },
  {
    id: '3',
    name: 'Lucas Santos',
    email: 'lucas.santos@itamoving.com',
    phone: '+1 (305) 555-9012',
    cpf: '456.789.123-03',
    birthDate: '1995-12-10',
    hireDate: '2021-06-01',
    position: 'Atendente',
    department: 'Comercial',
    salary: 2800.00,
    contractType: 'CLT',
    status: 'ACTIVE',
    address: {
      street: '321 Collins Ave',
      number: '456',
      city: 'Miami',
      state: 'FL',
      zipCode: '33140',
    },
    documents: {
      rg: '45.678.912-3',
    },
    benefits: ['Vale Transporte', 'Vale Refeição'],
    supervisor: 'Ana Paula',
  },
  {
    id: '4',
    name: 'Mariana Ferreira',
    email: 'mariana.ferreira@itamoving.com',
    phone: '+1 (305) 555-3456',
    cpf: '789.123.456-04',
    birthDate: '1992-03-18',
    hireDate: '2022-09-15',
    position: 'Coordenador',
    department: 'Logística',
    salary: 4200.00,
    contractType: 'CLT',
    status: 'ON_LEAVE',
    address: {
      street: '654 Washington Ave',
      number: '321',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
    },
    documents: {
      rg: '78.912.345-6',
      wordPassport: '4567891234',
    },
    benefits: ['Vale Transporte', 'Vale Refeição', 'Plano de Saúde'],
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
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>(transacoesIniciais);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [precosEntrega, setPrecosEntrega] = useState<PrecoEntrega[]>([]);
  const [precosProdutos, setPrecosProdutos] = useState<PrecoProduto[]>([]);
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