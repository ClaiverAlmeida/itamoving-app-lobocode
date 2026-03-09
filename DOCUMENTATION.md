# 📦 ITAMOVING - Sistema de Gestão de Mudanças Internacionais

## 🎯 Visão Geral

Sistema completo de gerenciamento para a **ITAMOVING**, empresa de mudanças internacionais EUA-Brasil. Aplicação SPA (Single Page Application) desenvolvida em React + TypeScript + Tailwind CSS com dados simulados em memória.

### 🎨 Identidade Visual
- **Azul Escuro:** `#1E3A5F` (Cor primária - confiança e profissionalismo)
- **Laranja:** `#F5A623` (Cor secundária - energia e movimento)
- **Azul Claro:** `#5DADE2` (Cor de destaque - leveza e modernidade)

---

## 📁 Estrutura do Projeto

```
/
├── src/
│   ├── app/
│   │   ├── components/           # Componentes da aplicação
│   │   │   ├── agendamentos.tsx  # Gestão de coletas
│   │   │   ├── atendimentos.tsx  # Pipeline estilo Pipedrive
│   │   │   ├── auth.tsx          # Tela de login
│   │   │   ├── clientes.tsx      # CRUD de clientes
│   │   │   ├── containers.tsx    # Gestão de containers
│   │   │   ├── dashboard.tsx     # Dashboard analítico
│   │   │   ├── estoque.tsx       # Controle de inventário
│   │   │   ├── financeiro.tsx    # Fluxo de caixa
│   │   │   ├── relatorios.tsx    # Relatórios diversos
│   │   │   ├── precos.tsx        # Gestão de preços e produtos
│   │   │   ├── whatsapp-chat.tsx # Chat do WhatsApp Bot
│   │   │   ├── figma/            # Componentes importados
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   └── ui/               # Componentes UI reutilizáveis
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── select.tsx
│   │   │       ├── table.tsx
│   │   │       └── ... (50+ componentes)
│   │   ├── context/
│   │   │   └── DataContext.tsx   # Gerenciamento de estado global
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   └── App.tsx               # Componente raiz
│   ├── styles/
│   │   ├── fonts.css             # Importação de fontes
│   │   ├── index.css             # Estilos globais
│   │   ├── tailwind.css          # Config Tailwind v4
│   │   └── theme.css             # Tokens CSS personalizados
│   └── main.tsx                  # Entry point
├── package.json
├── vite.config.ts
└── DOCUMENTATION.md              # Este arquivo
```

---

## 🧩 Componentes Principais

### 1. **App.tsx** - Componente Raiz
- Gerencia autenticação
- Controla navegação entre telas
- Renderiza sidebar responsiva
- Header com informações do usuário

**Navegação disponível:**
- Dashboard
- Clientes
- Estoque
- Agendamentos
- Containers
- Financeiro
- Relatórios
- Atendimentos (Pipeline)
- Preços
- RH - Recursos Humanos

### 2. **Dashboard** (`dashboard.tsx`)
**Funcionalidades:**
- ✅ KPI Cards animados (Clientes, Agendamentos, Receita, Estoque)
- ✅ Alertas inteligentes (atrasados, estoque baixo, etc)
- ✅ Gráficos com Recharts (Performance Financeira, Status Containers, Estoque)
- ✅ Timeline de atividades recentes
- ✅ Próximos agendamentos
- ✅ Navegação para outras telas via botões

**Props:**
```typescript
interface DashboardViewProps {
  onNavigate?: (view: View) => void;
}
```

### 3. **Clientes** (`clientes.tsx`)
**Funcionalidades:**
- ✅ CRUD completo de clientes
- ✅ Formulário com dados USA e Brasil
- ✅ Busca e filtros avançados
- ✅ Visualização em cards premium
- ✅ Modal de edição/cadastro
- ✅ Confirmação de exclusão

**Campos principais:**
- Dados USA: Nome, CPF, Telefone, Endereço completo
- Dados Brasil: Recebedor, CPF, Endereço, Telefones
- Atendente responsável
- Status (ativo/inativo)

### 4. **Agendamentos** (`agendamentos.tsx`)
**Funcionalidades:**
- ✅ Calendário interativo (react-day-picker)
- ✅ CRUD de agendamentos de coleta
- ✅ Status: pendente, confirmado, coletado, cancelado
- ✅ Timeline visual de agendamentos
- ✅ Filtros por data e status
- ✅ Vinculação com clientes

### 5. **Containers** (`containers.tsx`)
**Funcionalidades:**
- ✅ CRUD completo de containers
- ✅ Visualizações: Grid, List, Kanban
- ✅ Drag-and-drop entre status (react-dnd)
- ✅ Tipos: 20ft, 40ft, 40ft HC, 45ft HC
- ✅ Rastreamento: origem, destino, datas
- ✅ Gestão de caixas por cliente
- ✅ Controle de peso e volume
- ✅ Status: preparando, em trânsito, entregue, cancelado

**Interface Container:**
```typescript
interface Container {
  id: string;
  numero: string;
  tipo?: '20ft' | '40ft' | '40ft HC' | '45ft HC';
  origem?: string;
  destino?: string;
  dataEnvio: string;
  dataEmbarque?: string;
  previsaoChegada?: string;
  status: 'preparando' | 'transito' | 'entregue' | 'cancelado';
  volume?: number;
  caixas: Array<{
    clienteId: string;
    clienteNome: string;
    numeroCaixa: string;
    tamanho: string;
    peso: number;
  }>;
  pesoTotal: number;
  limiteP: number;
}
```

### 6. **Estoque** (`estoque.tsx`)
**Funcionalidades:**
- ✅ Controle de caixas (Pequenas, Médias, Grandes)
- ✅ Controle de materiais (Fitas adesivas)
- ✅ Alertas de estoque baixo
- ✅ Atualização em tempo real
- ✅ Gráficos de distribuição

### 7. **Financeiro** (`financeiro.tsx`)
**Funcionalidades:**
- ✅ Registro de receitas e despesas
- ✅ Vinculação com clientes
- ✅ Categorização de transações
- ✅ Métodos de pagamento
- ✅ Gráficos financeiros
- ✅ Cálculo automático de lucro e margem

### 8. **Atendimentos** (`atendimentos.tsx`) - Pipeline Pipedrive Style
**Funcionalidades:**
- ✅ Pipeline visual Kanban
- ✅ Drag-and-drop entre etapas
- ✅ Gestão de leads do WhatsApp Bot
- ✅ Filtros avançados (status, data, atendente)
- ✅ Métricas em tempo real
- ✅ Sugestões de IA
- ✅ Chat do WhatsApp integrado

**Etapas do Pipeline:**
1. Novo Lead
2. Qualificação
3. Orçamento
4. Negociação
5. Fechado-Ganho / Fechado-Perdido

### 9. **Relatórios** (`relatorios.tsx`)
**Funcionalidades:**
- ✅ Relatórios pré-configurados
- ✅ Exportação de dados
- ✅ Visualizações gráficas
- ✅ Análises customizadas

### 10. **Preços** (`precos.tsx`)
**Funcionalidades:**
- ✅ Tabela de preços de entrega por cidade
- ✅ CRUD completo de rotas EUA-Brasil
- ✅ Gestão de produtos (caixas e fitas)
- ✅ Controle de estoque de produtos
- ✅ Cálculo de margem de lucro
- ✅ Alertas de estoque baixo
- ✅ Status ativo/inativo por rota
- ✅ Filtros e busca avançada
- ✅ Dashboard com KPIs de preços

**Interface PrecoEntrega:**
```typescript
interface PrecoEntrega {
  id: string;
  cidadeOrigem: string;
  estadoOrigem: string;
  cidadeDestino: string;
  estadoDestino: string;
  precoPorKg: number;
  precoMinimo: number;
  prazoEntrega: number; // dias
  ativo: boolean;
}
```

**Interface PrecoProduto:**
```typescript
interface PrecoProduto {
  id: string;
  tipo: 'caixa' | 'fita';
  nome: string;
  tamanho?: string; // Pequena, Média, Grande
  dimensoes?: string; // ex: "40x30x25cm"
  pesoMaximo?: number; // kg
  unidade: string; // unidade, rolo, pacote
  precoCusto: number;
  precoVenda: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
}
```

**Dados Mockados:**
- 4 rotas de entrega configuradas (Miami-SP, Orlando-RJ, Tampa-BH, Fort Lauderdale-DF)
- 6 produtos: 3 tamanhos de caixas + 3 tipos de fitas
- Cálculo automático de margem de lucro
- Alertas para estoque abaixo do mínimo

### 11. **RH - Recursos Humanos** (`rh.tsx`)
**Funcionalidades:**
- ✅ CRUD completo de funcionários
- ✅ Controle de ponto eletrônico
- ✅ Cálculo automático de horas trabalhadas
- ✅ Cálculo automático de horas extras
- ✅ Folha de pagamento mensal
- ✅ Gestão de férias (solicitação e aprovação)
- ✅ Status de funcionários (ativo, férias, afastado, demitido)
- ✅ Dashboard com KPIs de RH
- ✅ Sistema de abas (Funcionários, Ponto, Folha, Férias)
- ✅ Modal de visualização detalhada
- ✅ Avatares com iniciais

**Interface Funcionario:**
```typescript
interface Funcionario {
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
  tipoContrato: 'CLT' | 'PJ' | 'Temporário' | 'Estágio';
  status: 'ativo' | 'férias' | 'afastado' | 'demitido';
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
```

**Interface RegistroPonto:**
```typescript
interface RegistroPonto {
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
  tipo: 'normal' | 'falta' | 'atestado' | 'folga';
  observacoes?: string;
}
```

**Interface Folha:**
```typescript
interface Folha {
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
  status: 'pendente' | 'pago' | 'atrasado';
}
```

**Interface Ferias:**
```typescript
interface Ferias {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  periodoAquisitivo: string;
  dataInicio: string;
  dataFim: string;
  diasCorridos: number;
  status: 'solicitado' | 'aprovado' | 'em-andamento' | 'concluído' | 'cancelado';
  observacoes?: string;
}
```

**Dados Mockados:**
- 4 funcionários cadastrados (Motorista, Gerente, Atendente, Coordenador)
- 3 registros de ponto do dia atual com horas extras
- 3 folhas de pagamento de dezembro/2024 (todas pagas)
- 2 solicitações de férias (1 em andamento, 1 solicitada)
- Cálculos automáticos: horas trabalhadas, horas extras, INSS, FGTS
- KPIs: Total de funcionários, ativos, em férias, folha do mês

### 12. **WhatsApp Chat** (`whatsapp-chat.tsx`)
**Funcionalidades:**
- ✅ Interface de chat estilo WhatsApp
- ✅ Mensagens em tempo real (simulado)
- ✅ Envio de mensagens
- ✅ Histórico de conversas
- ✅ Integração com Pipeline de Atendimentos

---

## 🗂️ Gerenciamento de Estado

### DataContext (`context/DataContext.tsx`)

**Context Provider centralizado** que gerencia todos os dados da aplicação em memória.

#### Estados Gerenciados:

```typescript
interface DataContextType {
  // Clientes
  clientes: Cliente[];
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  // Estoque
  estoque: Estoque;
  updateEstoque: (estoque: Partial<Estoque>) => void;
  
  // Agendamentos
  agendamentos: Agendamento[];
  setAgendamentos: (agendamentos: Agendamento[]) => void;
  addAgendamento: (agendamento: Agendamento) => void;
  updateAgendamento: (id: string, agendamento: Partial<Agendamento>) => void;
  deleteAgendamento: (id: string) => void;
  
  // Containers
  containers: Container[];
  setContainers: (containers: Container[]) => void;
  addContainer: (container: Container) => void;
  updateContainer: (id: string, container: Partial<Container>) => void;
  deleteContainer: (id: string) => void;
  
  // Transações
  transacoes: Transacao[];
  setTransacoes: (transacoes: Transacao[]) => void;
  addTransacao: (transacao: Transacao) => void;
  deleteTransacao: (id: string) => void;
  
  // Rotas
  rotas: Rota[];
  setRotas: (rotas: Rota[]) => void;
  
  // Preços de Entrega
  precosEntrega: PrecoEntrega[];
  setPrecosEntrega: (precos: PrecoEntrega[]) => void;
  addPrecoEntrega: (preco: PrecoEntrega) => void;
  updatePrecoEntrega: (id: string, preco: Partial<PrecoEntrega>) => void;
  deletePrecoEntrega: (id: string) => void;
  
  // Preços de Produtos
  precosProdutos: PrecoProduto[];
  setPrecosProdutos: (precos: PrecoProduto[]) => void;
  addPrecoProduto: (preco: PrecoProduto) => void;
  updatePrecoProduto: (id: string, preco: Partial<PrecoProduto>) => void;
  deletePrecoProduto: (id: string) => void;
  
  // Funcionários
  funcionarios: Funcionario[];
  setFuncionarios: (funcionarios: Funcionario[]) => void;
  addFuncionario: (funcionario: Funcionario) => void;
  updateFuncionario: (id: string, funcionario: Partial<Funcionario>) => void;
  deleteFuncionario: (id: string) => void;
  
  // Registros de Ponto
  registrosPonto: RegistroPonto[];
  setRegistrosPonto: (registros: RegistroPonto[]) => void;
  addRegistroPonto: (registro: RegistroPonto) => void;
  updateRegistroPonto: (id: string, registro: Partial<RegistroPonto>) => void;
  deleteRegistroPonto: (id: string) => void;
  
  // Folhas de Pagamento
  folhas: Folha[];
  setFolhas: (folhas: Folha[]) => void;
  addFolha: (folha: Folha) => void;
  updateFolha: (id: string, folha: Partial<Folha>) => void;
  deleteFolha: (id: string) => void;
  
  // Solicitações de Férias
  ferias: Ferias[];
  setFerias: (ferias: Ferias[]) => void;
  addFerias: (ferias: Ferias) => void;
  updateFerias: (id: string, ferias: Partial<Ferias>) => void;
  deleteFerias: (id: string) => void;
}
```

#### Dados Mockados Iniciais:

**Clientes:** 2 clientes mockados
- João Silva (Miami → São Paulo)
- Carlos Mendes (Orlando → Rio de Janeiro)

**Containers:** 12 containers mockados
- 3 Entregues
- 4 Em Trânsito
- 3 Em Preparação
- 2 Cancelados

**Agendamentos:** 2 agendamentos mockados

**Transações:** 2 transações mockadas

**Estoque:**
- Caixas Pequenas: 50
- Caixas Médias: 35
- Caixas Grandes: 20
- Fitas Adesivas: 100

**Preços de Entrega:**
- 4 rotas configuradas (Miami-SP, Orlando-RJ, Tampa-BH, Fort Lauderdale-DF)

**Preços de Produtos:**
- 6 produtos: 3 tamanhos de caixas + 3 tipos de fitas

**Funcionários:** 4 funcionários mockados
- Motorista
- Gerente
- Atendente
- Coordenador

**Registros de Ponto:** 3 registros mockados do dia atual

**Folhas de Pagamento:** 3 folhas mockadas de dezembro/2024

**Solicitações de Férias:** 2 solicitações mockadas

#### Como usar:

```typescript
import { useData } from '../context/DataContext';

function MeuComponente() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useData();
  
  // Adicionar cliente
  const handleAdd = () => {
    addCliente({
      id: Date.now().toString(),
      nome: 'Novo Cliente',
      // ... outros campos
    });
  };
  
  // Atualizar cliente
  const handleUpdate = (id: string) => {
    updateCliente(id, { nome: 'Nome Atualizado' });
  };
  
  // Deletar cliente
  const handleDelete = (id: string) => {
    deleteCliente(id);
  };
  
  return <div>...</div>;
}
```

---

## 📐 TypeScript Interfaces

Arquivo: `types/index.ts`

### Principais Interfaces:

```typescript
// Cliente completo
export interface Cliente {
  id: string;
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
  status: 'ativo' | 'inativo';
}

// Estoque
export interface Estoque {
  caixasPequenas: number;
  caixasMedias: number;
  caixasGrandes: number;
  fitasAdesivas: number;
}

// Agendamento
export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  dataColeta: string;
  horaColeta: string;
  endereco: string;
  status: 'pendente' | 'confirmado' | 'coletado' | 'cancelado';
  observacoes?: string;
  atendente: string;
}

// Container (ver acima para interface completa)

// Transação Financeira
export interface Transacao {
  id: string;
  clienteId: string;
  clienteNome: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  valor: number;
  data: string;
  descricao: string;
  metodoPagamento: string;
}

// Rota
export interface Rota {
  id: string;
  data: string;
  agendamentos: Agendamento[];
  rotaOtimizada: string[];
  distanciaTotal: number;
  tempoEstimado: number;
}

// Preço de Entrega
export interface PrecoEntrega {
  id: string;
  cidadeOrigem: string;
  estadoOrigem: string;
  cidadeDestino: string;
  estadoDestino: string;
  precoPorKg: number;
  precoMinimo: number;
  prazoEntrega: number; // dias
  ativo: boolean;
}

// Preço de Produto
export interface PrecoProduto {
  id: string;
  tipo: 'caixa' | 'fita';
  nome: string;
  tamanho?: string; // Pequena, Média, Grande
  dimensoes?: string; // ex: "40x30x25cm"
  pesoMaximo?: number; // kg
  unidade: string; // unidade, rolo, pacote
  precoCusto: number;
  precoVenda: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
}

// Funcionário
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
  tipoContrato: 'CLT' | 'PJ' | 'Temporário' | 'Estágio';
  status: 'ativo' | 'férias' | 'afastado' | 'demitido';
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

// Registro de Ponto
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
  tipo: 'normal' | 'falta' | 'atestado' | 'folga';
  observacoes?: string;
}

// Folha de Pagamento
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
  status: 'pendente' | 'pago' | 'atrasado';
}

// Solicitação de Férias
export interface Ferias {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  periodoAquisitivo: string;
  dataInicio: string;
  dataFim: string;
  diasCorridos: number;
  status: 'solicitado' | 'aprovado' | 'em-andamento' | 'concluído' | 'cancelado';
  observacoes?: string;
}
```

---

## 🎨 Design System

### Cores (CSS Variables - `theme.css`)

```css
:root {
  /* Cores da marca */
  --accent: #1E3A5F;        /* Azul escuro */
  --secondary: #F5A623;     /* Laranja */
  --accent-light: #5DADE2;  /* Azul claro */
  
  /* Cores de estado */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

### Componentes UI

Biblioteca completa de componentes shadcn/ui customizados:
- **Formulários:** Input, Select, Textarea, Checkbox, Radio, Switch
- **Feedback:** Alert, Dialog, Toast (Sonner), Badge
- **Layout:** Card, Separator, Tabs, Accordion
- **Navegação:** Button, Dropdown, Navigation Menu
- **Data Display:** Table, Avatar, Calendar, Chart
- **Overlay:** Modal, Popover, Tooltip, Sheet

### Animações

Usando **Motion/React** (Framer Motion):
- Transições suaves entre estados
- Animações de entrada/saída
- Hover effects
- Drag-and-drop feedback

Exemplo:
```typescript
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* Conteúdo */}
</motion.div>
```

---

## 🔧 Tecnologias Utilizadas

### Core
- **React 18.3.1** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite 6.3.5** - Build tool
- **Tailwind CSS 4.1.12** - Estilização

### UI Libraries
- **Radix UI** - Componentes acessíveis headless
- **Lucide React** - Ícones
- **Motion/React** - Animações
- **Recharts** - Gráficos e dashboards
- **date-fns** - Manipulação de datas

### Funcionalidades Específicas
- **react-dnd** - Drag and drop
- **react-day-picker** - Calendário
- **react-hook-form** - Gerenciamento de formulários
- **sonner** - Notificações toast
- **react-signature-canvas** - Assinaturas digitais

### Material UI (Opcional)
- **@mui/material** - Componentes alternativos
- **@mui/icons-material** - Ícones Material

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm, npm ou yarn

### Instalação

```bash
# Instalar dependências
pnpm install
# ou
npm install
# ou
yarn install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev
# ou
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Build

```bash
# Gerar build de produção
pnpm build
# ou
npm run build
# ou
yarn build
```

---

## 🔐 Autenticação

Sistema de autenticação **simulado** para fins de demonstração.

**Credenciais padrão:**
- Email: `admin@itamoving.com`
- Senha: `Admin123@Senha`

**Arquivo:** `components/auth.tsx`

⚠️ **Nota:** Em produção, implementar autenticação real com backend seguro.

---

## 🗺️ Fluxo de Navegação

```
Login (Auth)
    ↓
Dashboard
    ├── Ver Agendamentos → Agendamentos
    ├── Ver Clientes → Clientes
    ├── Ver Containers → Containers
    └── Ver Financeiro → Financeiro

Sidebar Menu
    ├── Dashboard
    ├── Clientes
    ├── Estoque
    ├── Agendamentos
    ├── Containers
    ├── Financeiro
    ├── Relatórios
    ├── Atendimentos (Pipeline)
    ├── Preços
    └── RH - Recursos Humanos
```

**Navegação Programática:**

```typescript
// No Dashboard ou qualquer componente
interface Props {
  onNavigate?: (view: View) => void;
}

// Uso
<Button onClick={() => onNavigate?.('agendamentos')}>
  Ver Todos
</Button>
```

---

## 📊 Funcionalidades Implementadas

### ✅ Completas

1. **Autenticação**
   - Login simulado
   - Logout
   - Proteção de rotas

2. **Dashboard Analítico**
   - KPIs em tempo real
   - Gráficos interativos
   - Alertas inteligentes
   - Atividades recentes
   - Navegação contextual

3. **Gestão de Clientes**
   - CRUD completo
   - Busca e filtros
   - Dados USA e Brasil
   - Status ativo/inativo

4. **Gestão de Agendamentos**
   - CRUD completo
   - Calendário interativo
   - Timeline visual
   - Status tracking

5. **Gestão de Containers**
   - CRUD completo
   - Múltiplas visualizações (Grid/List/Kanban)
   - Drag-and-drop
   - Rastreamento completo
   - Gestão de caixas

6. **Controle de Estoque**
   - Inventário em tempo real
   - Alertas de estoque baixo
   - Atualização dinâmica

7. **Fluxo de Caixa**
   - Receitas e despesas
   - Categorização
   - Métricas financeiras
   - Gráficos

8. **Pipeline de Atendimentos**
   - Sistema Kanban estilo Pipedrive
   - Gestão de leads
   - WhatsApp Bot integrado
   - IA sugestões

9. **Relatórios**
   - Diversos tipos de relatórios
   - Visualizações gráficas

10. **Preços**
    - Tabela de preços de entrega por cidade
    - CRUD completo de rotas EUA-Brasil
    - Gestão de produtos (caixas e fitas)
    - Controle de estoque de produtos
    - Cálculo de margem de lucro
    - Alertas de estoque baixo
    - Status ativo/inativo por rota
    - Filtros e busca avançada
    - Dashboard com KPIs de preços

11. **RH - Recursos Humanos**
    - CRUD completo de funcionários
    - Controle de ponto eletrônico
    - Cálculo automático de horas trabalhadas
    - Cálculo automático de horas extras
    - Folha de pagamento mensal
    - Gestão de férias (solicitação e aprovação)
    - Status de funcionários (ativo, férias, afastado, demitido)
    - Dashboard com KPIs de RH
    - Sistema de abas (Funcionários, Ponto, Folha, Férias)
    - Modal de visualização detalhada
    - Avatares com iniciais

### 🔄 Em Desenvolvimento Futuro

- Sistema de rotas GPS real
- Assinatura digital de documentos
- Inventário fotográfico de bens
- Notificações push
- Integração com APIs reais
- Backend com banco de dados
- Autenticação JWT
- Upload de arquivos
- Exportação avançada (PDF, Excel)

---

## 🎯 Padrões de Código

### Nomenclatura

```typescript
// Componentes: PascalCase
export default function DashboardView() { }

// Hooks: camelCase com prefixo "use"
const { clientes } = useData();

// Interfaces: PascalCase
interface Cliente { }

// Constantes: UPPER_SNAKE_CASE
const MAX_CONTAINERS = 100;

// Funções: camelCase
const handleSubmit = () => { };
```

### Organização de Imports

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'motion/react';
import { format } from 'date-fns';

// 3. UI Components
import { Button } from './ui/button';
import { Card } from './ui/card';

// 4. Icons
import { Users, Calendar } from 'lucide-react';

// 5. Local imports
import { useData } from '../context/DataContext';
import type { Cliente } from '../types';
```

### TypeScript

```typescript
// Sempre tipar props
interface Props {
  title: string;
  onSubmit?: () => void;
  children?: React.ReactNode;
}

// Usar tipos específicos
const [status, setStatus] = useState<'pendente' | 'confirmado'>('pendente');

// Evitar 'any'
const data: Cliente[] = [];
```

### Tailwind CSS

```typescript
// Classes organizadas: layout → spacing → colors → effects
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
  
// Não usar classes de tipografia a menos que seja necessário
// O theme.css já define estilos padrão para cada elemento
<h1 className="">Título</h1> // ✅ Usa font-size do theme.css
<h1 className="text-4xl">Título</h1> // ❌ Só se necessário override
```

### Estado e Context

```typescript
// Preferir Context para estado global
const { clientes, addCliente } = useData();

// useState para estado local
const [isOpen, setIsOpen] = useState(false);

// useMemo para cálculos pesados
const total = useMemo(() => 
  items.reduce((sum, item) => sum + item.value, 0),
  [items]
);
```

---

## 🐛 Debugging

### Console Logs

```typescript
// Desenvolvimento
if (import.meta.env.DEV) {
  console.log('Debug:', data);
}
```

### React DevTools

Instalar extensão React DevTools para:
- Inspecionar componentes
- Analisar estado e props
- Performance profiling

### TypeScript Errors

```bash
# Verificar erros TypeScript
npx tsc --noEmit
```

---

## 📝 Notas Importantes

1. **Dados em Memória:** Todos os dados são armazenados em memória e resetam ao recarregar a página. Para persistência, implementar backend.

2. **Autenticação Simulada:** Sistema de login é apenas para demonstração. Não usar em produção.

3. **Assets:** Imagens são importadas via `figma:asset` (virtual module scheme).

4. **Responsividade:** Todo o sistema é responsivo, testado em desktop e mobile.

5. **Acessibilidade:** Componentes Radix UI garantem acessibilidade básica (ARIA, keyboard navigation).

6. **Performance:** 
   - Usar `useMemo` para cálculos pesados
   - `React.memo` para componentes que renderizam frequentemente
   - Lazy loading com `React.lazy` se necessário

7. **Tailwind v4:** Este projeto usa Tailwind CSS v4 com CSS variables. Não criar `tailwind.config.js`.

---

## 🔗 Links Úteis

- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Tailwind CSS:** https://tailwindcss.com/
- **Radix UI:** https://www.radix-ui.com/
- **Motion:** https://motion.dev/
- **Recharts:** https://recharts.org/
- **Lucide Icons:** https://lucide.dev/
- **date-fns:** https://date-fns.org/

---

## 👨‍💻 Desenvolvimento

### Adicionar Nova Funcionalidade

1. Criar componente em `/src/app/components/`
2. Adicionar tipos em `/src/app/types/index.ts`
3. Atualizar DataContext se necessário
4. Adicionar rota em `App.tsx`
5. Adicionar item no menu sidebar

### Exemplo: Adicionar tela de "Documentos"

```typescript
// 1. Criar /src/app/components/documentos.tsx
export default function DocumentosView() {
  return <div>Documentos</div>;
}

// 2. Adicionar em App.tsx
import DocumentosView from './components/documentos';

type View = 'dashboard' | 'clientes' | ... | 'documentos';

const menuItems = [
  // ...
  { id: 'documentos' as View, label: 'Documentos', icon: FileText }
];

const renderView = () => {
  switch (activeView) {
    // ...
    case 'documentos': return <DocumentosView />;
  }
};
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar esta documentação
2. Consultar código-fonte com comentários
3. Revisar interfaces TypeScript em `/types/index.ts`
4. Analisar DataContext para entender fluxo de dados

---

## 📄 Licença

Sistema proprietário da **ITAMOVING** - Todos os direitos reservados.

---

**Última atualização:** Dezembro 2024
**Versão do Sistema:** 1.0.0
**Desenvolvido com:** React + TypeScript + Tailwind CSS