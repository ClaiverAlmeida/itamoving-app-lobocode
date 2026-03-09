import { createContext, useContext, useState, ReactNode } from 'react';
import { Cliente, Estoque, Agendamento, Container, Transacao, Rota, PrecoEntrega, PrecoProduto, Usuario, OrdemServicoMotorista } from '../types';

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
  
  usuarios: Usuario[];
  setUsuarios: (usuarios: Usuario[]) => void;
  addUsuario: (usuarios: Usuario) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  
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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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

  const addUsuario = (usuario: Usuario) => {
    setUsuarios([...usuarios, usuario]);
  };

  const updateUsuario = (id: string, usuarioUpdate: Partial<Usuario>) => {
    setUsuarios(usuarios.map(f => f.id === id ? { ...f, ...usuarioUpdate } : f));
  };

  const deleteUsuario = (id: string) => {
    setUsuarios(usuarios.filter(f => f.id !== id));
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
        usuarios,
        setUsuarios,
        addUsuario,
        updateUsuario,
        deleteUsuario,
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