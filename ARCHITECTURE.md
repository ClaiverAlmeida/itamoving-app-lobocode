# 🏗️ ITAMOVING - Arquitetura do Sistema

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Alto Nível](#arquitetura-de-alto-nível)
3. [Camadas da Aplicação](#camadas-da-aplicação)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Estrutura de Diretórios](#estrutura-de-diretórios)
6. [Padrões de Design](#padrões-de-design)
7. [Gerenciamento de Estado](#gerenciamento-de-estado)
8. [Componentes e Interfaces](#componentes-e-interfaces)
9. [Segurança](#segurança)
10. [Performance e Otimização](#performance-e-otimização)
11. [Escalabilidade](#escalabilidade)
12. [Testes](#testes)
13. [Deploy e CI/CD](#deploy-e-cicd)

---

## 🎯 Visão Geral

### Descrição do Sistema

O **ITAMOVING** é um sistema de gestão empresarial completo desenvolvido para otimizar operações de mudanças internacionais entre Estados Unidos e Brasil. A aplicação é uma Single Page Application (SPA) moderna construída com React, TypeScript e Tailwind CSS.

### Objetivos Principais

- **Centralização**: Unificar todos os processos operacionais em uma única plataforma
- **Automação**: Reduzir trabalho manual através de cálculos automáticos e workflows inteligentes
- **Visibilidade**: Fornecer dashboards em tempo real com métricas de negócio
- **Eficiência**: Otimizar rotas, estoques e recursos humanos
- **Escalabilidade**: Preparar a base para crescimento futuro com backend real

### Stack Tecnológico

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (SPA)                      │
├─────────────────────────────────────────────────┤
│ React 18.3.1 + TypeScript 5.x                   │
│ Vite 6.3.5 (Build Tool)                         │
│ Tailwind CSS 4.1.12 (Styling)                   │
│ Motion/React (Animations)                       │
│ Radix UI (Accessible Components)                │
│ Recharts (Data Visualization)                   │
│ React DnD (Drag and Drop)                       │
│ date-fns (Date Manipulation)                    │
│ Lucide React (Icons)                            │
│ Sonner (Notifications)                          │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│          ESTADO (In-Memory)                      │
├─────────────────────────────────────────────────┤
│ React Context API                               │
│ useState + useReducer                           │
│ Mock Data (Desenvolvimento)                     │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│          FUTURO: BACKEND                         │
├─────────────────────────────────────────────────┤
│ REST API / GraphQL                              │
│ Node.js / Python / Java                         │
│ PostgreSQL / MongoDB                            │
│ Redis (Cache)                                   │
│ S3 (Storage)                                    │
└─────────────────────────────────────────────────┘
```

---

## 🏛️ Arquitetura de Alto Nível

### Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                   │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Routing    │  │     Auth     │  │   Layout    │ │  │
│  │  │  (App.tsx)   │  │  (auth.tsx)  │  │  (Sidebar)  │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │         ↓                 ↓                  ↓        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │         View Components (Pages)                 │ │  │
│  │  │  - Dashboard    - Containers    - Preços       │ │  │
│  │  │  - Clientes     - Financeiro    - RH           │ │  │
│  │  │  - Estoque      - Relatórios    - Atendimentos │ │  │
│  │  │  - Agendamentos                                 │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │         ↓                                            │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │         UI Components (Reusable)                │ │  │
│  │  │  - Button   - Dialog    - Table                 │ │  │
│  │  │  - Card     - Select    - Badge                 │ │  │
│  │  │  - Input    - Tabs      - Avatar                │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │         ↓                                            │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │         State Management                        │ │  │
│  │  │         (DataContext)                           │ │  │
│  │  │  - Clientes      - Containers    - Funcionários │ │  │
│  │  │  - Agendamentos  - Transações    - Ponto        │ │  │
│  │  │  - Estoque       - Preços        - Férias       │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │         ↓                                            │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │         Type System (TypeScript)                │ │  │
│  │  │         - Interfaces                            │ │  │
│  │  │         - Types                                 │ │  │
│  │  │         - Enums                                 │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Princípios Arquiteturais

1. **Separação de Responsabilidades (SoC)**
   - Apresentação (Views)
   - Lógica de Negócio (Hooks/Context)
   - Estado (Context API)
   - UI (Componentes reutilizáveis)

2. **Composição sobre Herança**
   - Componentes pequenos e focados
   - Reutilização através de composição
   - Props drilling minimizado com Context

3. **Unidirecionalidade de Dados**
   - Fluxo de dados top-down
   - Estado centralizado no Context
   - Imutabilidade de dados

4. **Type Safety**
   - TypeScript estrito
   - Interfaces bem definidas
   - Validação em tempo de compilação

5. **Mobile-First & Responsive**
   - Design responsivo
   - Breakpoints do Tailwind
   - Touch-friendly interactions

---

## 📚 Camadas da Aplicação

### 1. Camada de Apresentação (Presentation Layer)

**Responsabilidade**: Interface do usuário e interação

**Componentes**:
- View Components (`/components/*.tsx`)
- Layout Components (Sidebar, Header)
- Page Routing (App.tsx)

**Características**:
- Stateless quando possível
- Recebe dados via props ou hooks
- Delega lógica de negócio para hooks/context
- Foco em UI/UX

**Exemplo**:
```typescript
// components/clientes.tsx
export default function ClientesView() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useData();
  
  return (
    <div>
      {/* UI apenas - sem lógica de negócio */}
    </div>
  );
}
```

### 2. Camada de Lógica de Negócio (Business Logic Layer)

**Responsabilidade**: Regras de negócio e processamento

**Componentes**:
- Custom Hooks
- Utility Functions
- Cálculos e Validações

**Características**:
- Pura quando possível
- Testável isoladamente
- Reutilizável

**Exemplo**:
```typescript
// Cálculo de horas extras
const calcularHorasExtras = (entrada: string, saida: string): number => {
  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = saida.split(':').map(Number);
  const totalMinutos = (hS * 60 + mS) - (hE * 60 + mE);
  const horas = totalMinutos / 60;
  return horas > 8 ? horas - 8 : 0;
};
```

### 3. Camada de Estado (State Layer)

**Responsabilidade**: Gerenciamento de estado global

**Componentes**:
- DataContext
- Local State (useState)
- Derived State (useMemo)

**Características**:
- Single source of truth
- Imutável
- Previsível

**Exemplo**:
```typescript
// context/DataContext.tsx
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  
  const addCliente = (cliente: Cliente) => {
    setClientes(prev => [...prev, cliente]);
  };
  
  return (
    <DataContext.Provider value={{ clientes, addCliente }}>
      {children}
    </DataContext.Provider>
  );
}
```

### 4. Camada de Tipo (Type Layer)

**Responsabilidade**: Definições de tipos TypeScript

**Componentes**:
- Interfaces
- Types
- Enums

**Características**:
- Fortemente tipado
- Auto-documentado
- Validação em compile-time

**Exemplo**:
```typescript
// types/index.ts
export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  salario: number;
  status: 'ativo' | 'férias' | 'afastado' | 'demitido';
}
```

### 5. Camada de UI (UI Components Layer)

**Responsabilidade**: Componentes reutilizáveis

**Componentes**:
- Radix UI wrappers
- Custom UI components
- Styled components

**Características**:
- Altamente reutilizáveis
- Acessíveis (ARIA)
- Customizáveis via props

**Exemplo**:
```typescript
// components/ui/button.tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
```

---

## 🔄 Fluxo de Dados

### Fluxo Unidirecional

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                         │
│              (Click, Type, Drag, etc.)                       │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   EVENT HANDLER                              │
│              (handleSubmit, handleClick)                     │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   CONTEXT ACTION                             │
│          (addCliente, updateContainer, etc.)                 │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   STATE UPDATE                               │
│              (setClientes, setContainers)                    │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   REACT RE-RENDER                            │
│              (Component Updates)                             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   UI UPDATE                                  │
│              (DOM Changes Visible)                           │
└─────────────────────────────────────────────────────────────┘
```

### Exemplo Prático: Adicionar Cliente

```typescript
// 1. User fills form and clicks "Cadastrar"
<form onSubmit={handleSubmitCliente}>
  <Input value={formData.nome} onChange={...} />
  <Button type="submit">Cadastrar</Button>
</form>

// 2. Event Handler processes the action
const handleSubmitCliente = (e: React.FormEvent) => {
  e.preventDefault();
  
  // 3. Create new object
  const novoCliente: Cliente = {
    id: Date.now().toString(),
    nome: formData.nome,
    // ... other fields
  };
  
  // 4. Call Context action
  addCliente(novoCliente);
  
  // 5. Show notification
  toast.success('Cliente cadastrado com sucesso!');
  
  // 6. Reset form
  resetForm();
};

// 7. Context updates state
const addCliente = (cliente: Cliente) => {
  setClientes(prev => [...prev, cliente]); // Immutable update
};

// 8. React re-renders components using `clientes`
// 9. UI shows new client in the list
```

### Fluxo de Dados entre Componentes

```
App.tsx (Root)
    ↓
DataProvider (Context)
    ↓
┌───────────────┬───────────────┬───────────────┐
│               │               │               │
Dashboard   Clientes    Containers  ...etc
    ↓
useData() Hook
    ↓
Access to:
- clientes
- addCliente
- updateCliente
- deleteCliente
```

---

## 📁 Estrutura de Diretórios

### Árvore Completa

```
itamoving/
│
├── public/                          # Assets públicos estáticos
│   └── favicon.ico
│
├── src/                             # Código fonte
│   │
│   ├── app/                         # Aplicação principal
│   │   │
│   │   ├── components/              # Componentes da aplicação
│   │   │   ├── agendamentos.tsx     # View: Gestão de coletas
│   │   │   ├── atendimentos.tsx     # View: Pipeline de vendas
│   │   │   ├── auth.tsx             # Auth: Sistema de login
│   │   │   ├── clientes.tsx         # View: CRUD de clientes
│   │   │   ├── containers.tsx       # View: Gestão de containers
│   │   │   ├── dashboard.tsx        # View: Dashboard analítico
│   │   │   ├── estoque.tsx          # View: Controle de inventário
│   │   │   ├── financeiro.tsx       # View: Fluxo de caixa
│   │   │   ├── precos.tsx           # View: Tabela de preços
│   │   │   ├── relatorios.tsx       # View: Relatórios diversos
│   │   │   ├── rh.tsx               # View: Recursos Humanos
│   │   │   ├── whatsapp-chat.tsx    # Component: Chat WhatsApp
│   │   │   │
│   │   │   ├── figma/               # Componentes importados
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   │
│   │   │   └── ui/                  # Componentes UI reutilizáveis
│   │   │       ├── accordion.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── toast.tsx
│   │   │       ├── toaster.tsx
│   │   │       └── tooltip.tsx
│   │   │
│   │   ├── context/                 # Context API
│   │   │   └── DataContext.tsx      # Estado global centralizado
│   │   │
│   │   ├── types/                   # TypeScript definitions
│   │   │   └── index.ts             # Todas as interfaces
│   │   │
│   │   └── App.tsx                  # Componente raiz
│   │
│   ├── styles/                      # Estilos globais
│   │   ├── fonts.css                # Font imports
│   │   ├── index.css                # Global styles
│   │   ├── tailwind.css             # Tailwind config
│   │   └── theme.css                # CSS variables & tokens
│   │
│   └── main.tsx                     # Entry point
│
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── ARCHITECTURE.md                  # Este arquivo
├── DOCUMENTATION.md                 # Documentação de uso
└── README.md                        # Readme principal
```

### Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `ClientesView`, `DashboardCard` |
| Arquivos de Componentes | kebab-case.tsx | `clientes.tsx`, `whatsapp-chat.tsx` |
| Interfaces TypeScript | PascalCase | `Cliente`, `Funcionario` |
| Funções | camelCase | `addCliente`, `calculateTotal` |
| Constantes | UPPER_SNAKE_CASE | `MAX_CONTAINERS`, `DEFAULT_STATUS` |
| Variáveis | camelCase | `clienteAtivo`, `totalVendas` |
| Custom Hooks | camelCase com "use" | `useData`, `useAuth` |
| Context | PascalCase com "Context" | `DataContext`, `AuthContext` |

---

## 🎨 Padrões de Design

### 1. Container/Presenter Pattern

Separação entre lógica e apresentação:

```typescript
// Container (Smart Component)
export default function ClientesView() {
  const { clientes, addCliente } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClientes = useMemo(() => 
    clientes.filter(c => c.nome.includes(searchTerm)),
    [clientes, searchTerm]
  );
  
  return (
    <ClientesList 
      clientes={filteredClientes}
      onAdd={addCliente}
      searchTerm={searchTerm}
      onSearch={setSearchTerm}
    />
  );
}

// Presenter (Dumb Component)
function ClientesList({ clientes, onAdd, searchTerm, onSearch }) {
  return (
    <div>
      <Input value={searchTerm} onChange={e => onSearch(e.target.value)} />
      {clientes.map(cliente => <ClienteCard key={cliente.id} {...cliente} />)}
    </div>
  );
}
```

### 2. Compound Components Pattern

Componentes que trabalham juntos:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

### 3. Render Props Pattern

Para compartilhar lógica entre componentes:

```typescript
<DataProvider>
  {({ clientes, addCliente }) => (
    <ClientesView clientes={clientes} onAdd={addCliente} />
  )}
</DataProvider>
```

### 4. Higher-Order Components (HOC)

Enriquecimento de componentes:

```typescript
const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
};

export default withAuth(DashboardView);
```

### 5. Custom Hooks Pattern

Reutilização de lógica stateful:

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}
```

### 6. Provider Pattern

Context API para estado global:

```typescript
export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  const value = {
    clientes,
    addCliente: (cliente: Cliente) => setClientes(prev => [...prev, cliente])
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
```

---

## 🗃️ Gerenciamento de Estado

### Arquitetura de Estado

```
┌─────────────────────────────────────────────────────┐
│                  Application State                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │        Global State (Context API)          │    │
│  │  - Clientes                                │    │
│  │  - Agendamentos                            │    │
│  │  - Containers                              │    │
│  │  - Transações                              │    │
│  │  - Estoque                                 │    │
│  │  - Preços                                  │    │
│  │  - Funcionários                            │    │
│  │  - Registros de Ponto                      │    │
│  │  - Folhas de Pagamento                     │    │
│  │  - Férias                                  │    │
│  └────────────────────────────────────────────┘    │
│                       ↑                             │
│  ┌────────────────────────────────────────────┐    │
│  │        Local State (useState)              │    │
│  │  - Form inputs                             │    │
│  │  - UI state (modals, tabs)                 │    │
│  │  - Search filters                          │    │
│  │  - Temporary selections                    │    │
│  └────────────────────────────────────────────┘    │
│                       ↑                             │
│  ┌────────────────────────────────────────────┐    │
│  │        Derived State (useMemo)             │    │
│  │  - Filtered lists                          │    │
│  │  - Calculated totals                       │    │
│  │  - Sorted arrays                           │    │
│  │  - Aggregated data                         │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Estratégia de Estado

1. **Estado Global (Context)**
   - Dados compartilhados entre múltiplos componentes
   - Persistência durante toda a sessão
   - Exemplos: clientes, containers, funcionários

2. **Estado Local (useState)**
   - Dados específicos de um componente
   - Não precisa ser compartilhado
   - Exemplos: modal aberto/fechado, input de busca

3. **Estado Derivado (useMemo)**
   - Calculado a partir de outro estado
   - Evita recalcular a cada render
   - Exemplos: lista filtrada, totais calculados

### Exemplo de Implementação

```typescript
// DataContext.tsx - Estado Global
export function DataProvider({ children }: { children: ReactNode }) {
  // Estados globais
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [containers, setContainers] = useState<Container[]>(containersIniciais);
  
  // Ações (CRUD)
  const addCliente = (cliente: Cliente) => {
    setClientes(prev => [...prev, cliente]);
  };
  
  const updateCliente = (id: string, updates: Partial<Cliente>) => {
    setClientes(prev => 
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };
  
  const deleteCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  };
  
  return (
    <DataContext.Provider value={{ 
      clientes, 
      addCliente, 
      updateCliente, 
      deleteCliente 
    }}>
      {children}
    </DataContext.Provider>
  );
}

// Component - Uso do Estado
function ClientesView() {
  // Estado global via hook
  const { clientes, addCliente } = useData();
  
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estado derivado
  const filteredClientes = useMemo(() => 
    clientes.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [clientes, searchTerm]
  );
  
  return (
    <div>
      <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      {filteredClientes.map(cliente => <ClienteCard key={cliente.id} {...cliente} />)}
    </div>
  );
}
```

### Imutabilidade

Sempre criar novos objetos/arrays ao atualizar estado:

```typescript
// ❌ ERRADO - Mutação direta
const addCliente = (cliente: Cliente) => {
  clientes.push(cliente); // Mutação
  setClientes(clientes);
};

// ✅ CORRETO - Imutável
const addCliente = (cliente: Cliente) => {
  setClientes(prev => [...prev, cliente]); // Novo array
};

// ❌ ERRADO - Mutação de objeto
const updateCliente = (id: string, nome: string) => {
  const cliente = clientes.find(c => c.id === id);
  cliente.nome = nome; // Mutação
};

// ✅ CORRETO - Novo objeto
const updateCliente = (id: string, nome: string) => {
  setClientes(prev => 
    prev.map(c => c.id === id ? { ...c, nome } : c)
  );
};
```

---

## 🧩 Componentes e Interfaces

### Hierarquia de Componentes

```
App (Root)
│
├── Auth (Login)
│
├── Layout
│   ├── Sidebar
│   │   └── MenuItem[]
│   │
│   └── Header
│       ├── Logo
│       └── UserMenu
│
└── Views
    │
    ├── Dashboard
    │   ├── KPICard[]
    │   ├── AlertsSection
    │   ├── Charts
    │   │   ├── PerformanceChart
    │   │   ├── ContainersChart
    │   │   └── EstoqueChart
    │   └── RecentActivity
    │
    ├── Clientes
    │   ├── ClienteForm (Dialog)
    │   ├── SearchBar
    │   └── ClientesList
    │       └── ClienteCard[]
    │
    ├── Agendamentos
    │   ├── Calendar (react-day-picker)
    │   ├── AgendamentoForm (Dialog)
    │   └── AgendamentosList
    │       └── AgendamentoCard[]
    │
    ├── Containers
    │   ├── ViewModeToggle (Grid/List/Kanban)
    │   ├── FilterBar
    │   ├── ContainerForm (Dialog)
    │   └── ContainersDisplay
    │       ├── GridView
    │       ├── ListView
    │       └── KanbanView (react-dnd)
    │
    ├── Estoque
    │   ├── EstoqueCard[]
    │   └── EstoqueChart
    │
    ├── Financeiro
    │   ├── TransacaoForm (Dialog)
    │   ├── FilterBar
    │   ├── KPICards[]
    │   └── TransacoesList
    │       └── TransacaoCard[]
    │
    ├── Atendimentos
    │   ├── Pipeline (Kanban)
    │   │   └── PipelineColumn[]
    │   │       └── LeadCard[] (react-dnd)
    │   ├── FilterBar
    │   ├── MetricsSection
    │   └── WhatsAppChat (Dialog)
    │
    ├── Precos
    │   ├── Tabs
    │   │   ├── EntregasTab
    │   │   │   ├── PrecoEntregaForm
    │   │   │   └── PrecoEntregaTable
    │   │   └── ProdutosTab
    │   │       ├── PrecoProdutoForm
    │   │       └── PrecoProdutoTable
    │   └── KPICards[]
    │
    ├── RH
    │   ├── Tabs
    │   │   ├── FuncionariosTab
    │   │   │   ├── FuncionarioForm
    │   │   │   └── FuncionariosTable
    │   │   ├── PontoTab
    │   │   │   ├── RegistroPontoForm
    │   │   │   └── PontosTable
    │   │   ├── FolhaTab
    │   │   │   └── FolhasTable
    │   │   └── FeriasTab
    │   │       ├── FeriasForm
    │   │       └── FeriasTable
    │   └── KPICards[]
    │
    └── Relatorios
        ├── RelatorioSelector
        └── RelatorioDisplay
```

### Interfaces TypeScript Principais

```typescript
// Cliente
interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefoneUSA: string;
  enderecoUSA: Endereco;
  destinoBrasil: DestinoBrasil;
  atendente: string;
  dataCadastro: string;
  status: 'ativo' | 'inativo';
}

// Container
interface Container {
  id: string;
  numero: string;
  tipo: '20ft' | '40ft' | '40ft HC' | '45ft HC';
  origem: string;
  destino: string;
  dataEmbarque: string;
  previsaoChegada: string;
  status: 'preparando' | 'transito' | 'entregue' | 'cancelado';
  caixas: CaixaContainer[];
  pesoTotal: number;
  limiteP: number;
}

// Funcionário
interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  cargo: string;
  departamento: string;
  salario: number;
  tipoContrato: 'CLT' | 'PJ' | 'Temporário' | 'Estágio';
  status: 'ativo' | 'férias' | 'afastado' | 'demitido';
  endereco: Endereco;
}

// Registro de Ponto
interface RegistroPonto {
  id: string;
  funcionarioId: string;
  data: string;
  entrada: string;
  saida: string;
  horasTrabalhadas: number;
  horasExtras: number;
  tipo: 'normal' | 'falta' | 'atestado' | 'folga';
}
```

---

## 🔒 Segurança

### Práticas de Segurança Implementadas

1. **Type Safety com TypeScript**
   ```typescript
   // Validação em compile-time
   interface Cliente {
     id: string;
     nome: string;
     status: 'ativo' | 'inativo'; // Union type - previne valores inválidos
   }
   ```

2. **Sanitização de Inputs**
   ```typescript
   // Prevenir XSS
   const sanitizeInput = (input: string): string => {
     return input.replace(/[<>]/g, '');
   };
   ```

3. **Validação de Formulários**
   ```typescript
   // Validação antes de submeter
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!formData.nome || !formData.email) {
       toast.error('Campos obrigatórios não preenchidos');
       return;
     }
     
     if (!isValidEmail(formData.email)) {
       toast.error('Email inválido');
       return;
     }
     
     // Prosseguir com o submit
   };
   ```

4. **Confirmação de Ações Destrutivas**
   ```typescript
   const handleDelete = (id: string) => {
     if (confirm('Tem certeza que deseja excluir?')) {
       deleteCliente(id);
     }
   };
   ```

### Recomendações para Produção

1. **Autenticação Real**
   - JWT tokens
   - Refresh tokens
   - Session management
   - OAuth 2.0 / OpenID Connect

2. **Autorização**
   - Role-based access control (RBAC)
   - Permissions por módulo
   - Validação no backend

3. **HTTPS**
   - Certificado SSL/TLS
   - HSTS headers
   - Secure cookies

4. **Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'">
   ```

5. **Rate Limiting**
   - Limitar requisições por IP
   - Throttling de APIs

6. **Logs e Auditoria**
   - Log de ações sensíveis
   - Rastreamento de alterações
   - Detecção de anomalias

---

## ⚡ Performance e Otimização

### Estratégias de Performance

1. **Code Splitting**
   ```typescript
   // Lazy loading de componentes
   const Dashboard = lazy(() => import('./components/dashboard'));
   const Clientes = lazy(() => import('./components/clientes'));
   
   <Suspense fallback={<Loading />}>
     <Dashboard />
   </Suspense>
   ```

2. **Memoização**
   ```typescript
   // Evitar recálculos desnecessários
   const filteredItems = useMemo(() => 
     items.filter(item => item.status === 'ativo'),
     [items]
   );
   
   // Evitar re-renders de componentes
   const MemoizedComponent = React.memo(ExpensiveComponent);
   ```

3. **Debouncing e Throttling**
   ```typescript
   // Debounce para search
   const [searchTerm, setSearchTerm] = useState('');
   
   const debouncedSearch = useMemo(
     () => debounce((value: string) => {
       // Perform search
     }, 300),
     []
   );
   ```

4. **Virtualização de Listas**
   ```typescript
   // Para listas muito grandes
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={600}
     itemCount={items.length}
     itemSize={50}
   >
     {({ index, style }) => <Item style={style} data={items[index]} />}
   </FixedSizeList>
   ```

5. **Image Optimization**
   - Lazy loading de imagens
   - Formatos modernos (WebP, AVIF)
   - Responsive images
   - CDN para assets

6. **Bundle Size Optimization**
   ```bash
   # Análise do bundle
   npm run build
   npx vite-bundle-visualizer
   ```

### Métricas de Performance

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

---

## 📈 Escalabilidade

### Preparação para Crescimento

1. **Arquitetura Modular**
   - Componentes desacoplados
   - Feature-based organization
   - Fácil adição de novos módulos

2. **Backend Integration Ready**
   ```typescript
   // Camada de API abstraída
   class APIClient {
     async getClientes(): Promise<Cliente[]> {
       // Atualmente: mock data
       return mockClientes;
       
       // Futuro: API real
       // const response = await fetch('/api/clientes');
       // return response.json();
     }
   }
   ```

3. **State Management Evolution Path**
   ```
   Current: React Context API
      ↓
   Growth: Redux Toolkit / Zustand
      ↓
   Scale: Redux + Redux Saga / React Query
   ```

4. **Caching Strategy**
   - LocalStorage para preferências
   - SessionStorage para dados temporários
   - IndexedDB para grandes volumes
   - React Query para cache de API

5. **Microservices Ready**
   ```
   Frontend (Current SPA)
      ↓
   BFF (Backend for Frontend)
      ↓
   Microservices
   ├── Customer Service
   ├── Container Service
   ├── HR Service
   ├── Financial Service
   └── Notification Service
   ```

### Estratégia de Migração para Backend

```
Phase 1: Manter frontend atual
  - Criar API REST/GraphQL
  - Migrar DataContext para API calls
  - Adicionar React Query

Phase 2: Autenticação real
  - JWT tokens
  - Session management
  - Protected routes

Phase 3: Persistência
  - Banco de dados (PostgreSQL)
  - File storage (S3)
  - Cache (Redis)

Phase 4: Features avançadas
  - WebSockets (real-time)
  - Push notifications
  - Background jobs
  - Email service
```

---

## 🧪 Testes

### Estratégia de Testes

```
┌─────────────────────────────────────────────┐
│         Testing Pyramid                     │
├─────────────────────────────────────────────┤
│                                             │
│           E2E Tests (5%)                    │
│        Cypress / Playwright                 │
│                                             │
│        Integration Tests (15%)              │
│        React Testing Library               │
│                                             │
│          Unit Tests (80%)                   │
│        Vitest / Jest                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Unit Tests

```typescript
// types/index.test.ts
describe('Cliente Interface', () => {
  it('should create valid cliente object', () => {
    const cliente: Cliente = {
      id: '1',
      nome: 'João Silva',
      cpf: '123.456.789-01',
      status: 'ativo',
      // ...
    };
    
    expect(cliente.nome).toBe('João Silva');
    expect(cliente.status).toBe('ativo');
  });
});

// utils/calculations.test.ts
describe('calculateHorasExtras', () => {
  it('should calculate overtime correctly', () => {
    const result = calculateHorasExtras('08:00', '18:00');
    expect(result).toBe(2); // 10 horas - 8 horas = 2 horas extras
  });
  
  it('should return 0 when no overtime', () => {
    const result = calculateHorasExtras('08:00', '16:00');
    expect(result).toBe(0);
  });
});
```

### Integration Tests

```typescript
// components/clientes.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ClientesView from './clientes';
import { DataProvider } from '../context/DataContext';

describe('ClientesView', () => {
  it('should add new cliente', async () => {
    render(
      <DataProvider>
        <ClientesView />
      </DataProvider>
    );
    
    fireEvent.click(screen.getByText('Novo Cliente'));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Test User' } });
    fireEvent.click(screen.getByText('Cadastrar'));
    
    expect(await screen.findByText('Test User')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// e2e/cliente-flow.spec.ts
describe('Cliente Management Flow', () => {
  it('should complete full CRUD flow', () => {
    cy.visit('/');
    cy.login('admin@itamoving.com', 'admin123');
    
    // Navigate to Clientes
    cy.get('[data-testid="nav-clientes"]').click();
    
    // Create
    cy.get('[data-testid="btn-novo-cliente"]').click();
    cy.get('[name="nome"]').type('João Silva');
    cy.get('[name="email"]').type('joao@test.com');
    cy.get('[data-testid="btn-submit"]').click();
    cy.contains('Cliente cadastrado com sucesso');
    
    // Read
    cy.contains('João Silva').should('be.visible');
    
    // Update
    cy.get('[data-testid="btn-edit"]').first().click();
    cy.get('[name="nome"]').clear().type('João Silva Updated');
    cy.get('[data-testid="btn-submit"]').click();
    cy.contains('João Silva Updated');
    
    // Delete
    cy.get('[data-testid="btn-delete"]').first().click();
    cy.get('[data-testid="confirm-delete"]').click();
    cy.contains('João Silva Updated').should('not.exist');
  });
});
```

### Test Coverage Goals

- **Unit Tests**: > 80%
- **Integration Tests**: > 60%
- **E2E Tests**: Critical paths

---

## 🚀 Deploy e CI/CD

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build
# Output: dist/

# Preview production build
npm run preview
```

### Deployment Targets

1. **Vercel** (Recomendado)
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   
   # Production deploy
   vercel --prod
   ```

2. **Netlify**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **AWS S3 + CloudFront**
   ```bash
   # Build
   npm run build
   
   # Upload to S3
   aws s3 sync dist/ s3://itamoving-app --delete
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
   ```

4. **Docker**
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Variables

```bash
# .env.example
VITE_API_URL=https://api.itamoving.com
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

### Monitoring & Analytics

1. **Sentry** - Error tracking
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.VITE_APP_ENV,
   });
   ```

2. **Google Analytics**
   ```typescript
   import ReactGA from 'react-ga4';
   
   ReactGA.initialize(import.meta.env.VITE_GA_ID);
   ```

3. **LogRocket** - Session replay
   ```typescript
   import LogRocket from 'logrocket';
   
   LogRocket.init(import.meta.env.VITE_LOGROCKET_ID);
   ```

---

## 📊 Diagramas de Sequência

### Fluxo de Cadastro de Cliente

```
User                ClientesView          DataContext           Toast
 |                       |                      |                  |
 |--Click "Novo"-------->|                      |                  |
 |                       |--Open Dialog-------->|                  |
 |                       |                      |                  |
 |--Fill Form----------->|                      |                  |
 |--Click "Cadastrar"--->|                      |                  |
 |                       |--addCliente()------->|                  |
 |                       |                      |--setClientes()   |
 |                       |                      |<-----------------|
 |                       |<--Promise resolved---|                  |
 |                       |--toast.success()------------------------>|
 |                       |--Close Dialog------->|                  |
 |<--UI Update-----------|<--Re-render----------|                  |
```

### Fluxo de Login

```
User               Auth              App            Dashboard
 |                  |                 |                |
 |--Enter creds---->|                 |                |
 |--Click Login---->|                 |                |
 |                  |--validate()     |                |
 |                  |--setAuth(true)->|                |
 |                  |                 |--render()----->|
 |<-Redirect to Dashboard-------------|<---------------|
```

---

## 🔄 Roadmap Técnico

### Fase 1: MVP (Atual) ✅
- [x] Interface completa em React
- [x] CRUD de todas entidades
- [x] Estado em memória (Context API)
- [x] Dados mockados
- [x] Design system completo
- [x] Responsividade

### Fase 2: Backend Integration
- [ ] API REST / GraphQL
- [ ] Autenticação JWT
- [ ] Banco de dados PostgreSQL
- [ ] File storage (S3)
- [ ] React Query para cache

### Fase 3: Features Avançadas
- [ ] WebSockets (real-time updates)
- [ ] Push notifications
- [ ] Email service (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Background jobs (Bull Queue)

### Fase 4: Mobile
- [ ] PWA (Progressive Web App)
- [ ] React Native app
- [ ] Offline-first support
- [ ] Push notifications mobile

### Fase 5: Analytics & IA
- [ ] Business Intelligence dashboard
- [ ] Machine Learning para previsões
- [ ] Chatbot inteligente
- [ ] Recomendações automáticas

---

## 📞 Contato e Suporte Técnico

### Documentação
- **Arquitetura**: Este arquivo (ARCHITECTURE.md)
- **Documentação de Uso**: DOCUMENTATION.md
- **Readme**: README.md

### Convenções de Código
- **Style Guide**: Airbnb React/JSX Style Guide
- **Commit Messages**: Conventional Commits
- **Branching**: Git Flow

### Code Review Checklist
- [ ] TypeScript sem erros
- [ ] Componentes com prop types
- [ ] Código comentado quando necessário
- [ ] Performance otimizada (memoização)
- [ ] Acessibilidade (ARIA labels)
- [ ] Responsivo (mobile-first)
- [ ] Testes escritos
- [ ] Documentação atualizada

---

**Última atualização**: Dezembro 2024  
**Versão da Arquitetura**: 1.0.0  
**Autor**: Equipe de Desenvolvimento ITAMOVING
