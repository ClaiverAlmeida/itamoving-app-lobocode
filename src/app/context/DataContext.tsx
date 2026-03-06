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
    employeeId: '4',
    employeeName: 'Mariana Ferreira',
    accrualPeriod: '2023/2024',
    startDate: '2024-12-20',
    endDate: '2025-01-03',
    daysTaken: 15,
    status: 'IN_PROGRESS',
    notes: 'Férias de fim de ano',
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'Roberto Costa',
    accrualPeriod: '2024/2025',
    startDate: '2025-07-01',
    endDate: '2025-07-30',
    daysTaken: 30,
    status: 'REQUESTED',
    notes: 'Viagem para o Brasil',
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
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [registrosPonto, setRegistrosPonto] = useState<RegistroPonto[]>([]);
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

  const addFerias = (novaFerias: Ferias) => {
    setFerias(prev => [...prev, novaFerias]);
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