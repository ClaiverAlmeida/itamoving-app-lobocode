# 👨‍💻 ITAMOVING - Guia do Desenvolvedor

## 📋 Índice

1. [Introdução](#introdução)
2. [Setup do Ambiente](#setup-do-ambiente)
3. [Estrutura do Código](#estrutura-do-código)
4. [Convenções e Padrões](#convenções-e-padrões)
5. [Como Criar um Novo Módulo](#como-criar-um-novo-módulo)
6. [Como Adicionar uma Nova Feature](#como-adicionar-uma-nova-feature)
7. [Trabalhando com Estado](#trabalhando-com-estado)
8. [Componentes UI](#componentes-ui)
9. [Estilização com Tailwind](#estilização-com-tailwind)
10. [Debugging e Troubleshooting](#debugging-e-troubleshooting)
11. [Git Workflow](#git-workflow)
12. [Code Review Checklist](#code-review-checklist)

---

## 🎯 Introdução

Bem-vindo ao time de desenvolvimento do **ITAMOVING**! Este guia vai te ajudar a entender a estrutura do projeto, padrões de código e como contribuir efetivamente.

### Tecnologias Principais

- **React 18.3.1** - UI Framework
- **TypeScript 5.x** - Type safety
- **Vite 6.3.5** - Build tool
- **Tailwind CSS 4.1.12** - Styling
- **Motion/React** - Animations

### Documentação Relacionada

- **[README.md](./README.md)** - Visão geral do projeto
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura detalhada
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentação de uso
- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** - Design de sistema

---

## 🛠️ Setup do Ambiente

### Requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (recomendado) ([Download](https://code.visualstudio.com/))

### Extensões Recomendadas do VS Code

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "wix.vscode-import-cost",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/itamoving/sistema-gestao.git
cd sistema-gestao

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra no navegador
# http://localhost:5173
```

### Configuração do VS Code

Crie `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia dev server

# Build
npm run build        # Build para produção
npm run preview      # Preview do build

# Testes (quando implementado)
npm run test         # Roda testes
npm run test:watch   # Testes em watch mode
npm run test:coverage # Coverage report

# Linting (quando implementado)
npm run lint         # Verifica código
npm run lint:fix     # Corrige automaticamente

# Type checking
npx tsc --noEmit     # Verifica tipos TypeScript
```

---

## 📁 Estrutura do Código

### Organização de Arquivos

```
src/
├── app/
│   ├── components/        # Todos os componentes React
│   │   ├── *.tsx          # Views (páginas)
│   │   ├── ui/            # Componentes UI reutilizáveis
│   │   └── figma/         # Componentes importados
│   ├── context/           # React Context
│   │   └── DataContext.tsx
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   └── App.tsx            # Root component
├── styles/                # Estilos globais
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css       # Tailwind v4 config
│   └── theme.css          # CSS variables
└── main.tsx               # Entry point
```

### Tipos de Componentes

1. **View Components** (Páginas)
   - Localização: `/src/app/components/*.tsx`
   - Exemplos: `clientes.tsx`, `dashboard.tsx`, `rh.tsx`
   - Responsabilidade: Layout da página, orquestração

2. **UI Components** (Reutilizáveis)
   - Localização: `/src/app/components/ui/*.tsx`
   - Exemplos: `button.tsx`, `card.tsx`, `dialog.tsx`
   - Responsabilidade: UI primitivos, altamente reutilizáveis

3. **Feature Components** (Específicos)
   - Localização: Dentro dos view components
   - Exemplos: `ClienteCard`, `AgendamentoForm`
   - Responsabilidade: Lógica específica de feature

---

## 📏 Convenções e Padrões

### Nomenclatura

#### Arquivos

```
kebab-case.tsx     # Componentes
camelCase.ts       # Utilities, helpers
PascalCase.tsx     # Componentes quando exportar classe
```

#### Componentes

```typescript
// ✅ BOM - PascalCase
export default function ClientesView() {}
export function ClienteCard() {}

// ❌ RUIM
export default function clientesView() {}
export function cliente_card() {}
```

#### Variáveis e Funções

```typescript
// ✅ BOM - camelCase
const clienteAtivo = true;
const handleSubmit = () => {};
const totalClientes = 10;

// ❌ RUIM
const ClienteAtivo = true;
const handle_submit = () => {};
const TotalClientes = 10;
```

#### Constantes

```typescript
// ✅ BOM - UPPER_SNAKE_CASE
const MAX_CONTAINERS = 100;
const DEFAULT_STATUS = 'ativo';
const API_URL = 'https://api.example.com';

// ❌ RUIM
const maxContainers = 100;
const defaultStatus = 'ativo';
```

#### Interfaces e Types

```typescript
// ✅ BOM - PascalCase
interface Cliente {
  id: string;
  nome: string;
}

type Status = 'ativo' | 'inativo';

// ❌ RUIM
interface cliente {}
type status = 'ativo' | 'inativo';
```

### Organização de Imports

```typescript
// 1. React e hooks
import { useState, useEffect, useMemo } from 'react';

// 2. Third-party libraries
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// 3. UI Components (ordem alfabética)
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';

// 4. Icons
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

// 5. Local imports
import { useData } from '../context/DataContext';
import type { Cliente, Agendamento } from '../types';

// 6. Styles (se necessário)
import './styles.css';
```

### Estrutura de Componente

```typescript
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useData } from '../context/DataContext';
import type { Cliente } from '../types';

// 1. Interfaces/Types locais
interface ClientesViewProps {
  onNavigate?: (view: string) => void;
}

// 2. Componente principal
export default function ClientesView({ onNavigate }: ClientesViewProps) {
  // 2.1. Hooks de contexto
  const { clientes, addCliente } = useData();
  
  // 2.2. Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 2.3. Estado derivado (useMemo)
  const filteredClientes = useMemo(() => 
    clientes.filter(c => c.nome.includes(searchTerm)),
    [clientes, searchTerm]
  );
  
  // 2.4. Effects
  useEffect(() => {
    // Side effects aqui
  }, []);
  
  // 2.5. Event handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submit
  };
  
  const handleDelete = (id: string) => {
    // Handle delete
  };
  
  // 2.6. Render helpers (optional)
  const renderClienteCard = (cliente: Cliente) => {
    return <div key={cliente.id}>{cliente.nome}</div>;
  };
  
  // 2.7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 3. Sub-componentes (se necessário)
function ClienteCard({ cliente }: { cliente: Cliente }) {
  return <div>{cliente.nome}</div>;
}
```

### TypeScript Best Practices

```typescript
// ✅ BOM - Sempre tipar props
interface Props {
  nome: string;
  idade?: number;  // Optional
  onClick: () => void;
}

function Componente({ nome, idade = 18, onClick }: Props) {}

// ✅ BOM - Tipar estado
const [cliente, setCliente] = useState<Cliente | null>(null);
const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

// ✅ BOM - Tipar arrays
const clientes: Cliente[] = [];
const ids: string[] = [];

// ✅ BOM - Type guards
function isCliente(obj: any): obj is Cliente {
  return obj && typeof obj.id === 'string' && typeof obj.nome === 'string';
}

// ❌ EVITAR - any
const data: any = {};  // Evite usar 'any'

// ✅ BOM - unknown quando tipo não é conhecido
const data: unknown = fetchData();
if (isCliente(data)) {
  console.log(data.nome); // TypeScript sabe que é Cliente
}
```

---

## 🆕 Como Criar um Novo Módulo

### Exemplo: Criar módulo "Fornecedores"

#### Passo 1: Criar Interfaces TypeScript

Edite `/src/app/types/index.ts`:

```typescript
export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  categoria: 'materiais' | 'transporte' | 'servicos';
  endereco: {
    rua: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  status: 'ativo' | 'inativo';
  dataCadastro: string;
}
```

#### Passo 2: Adicionar ao Context

Edite `/src/app/context/DataContext.tsx`:

```typescript
// 1. Adicionar ao tipo do Context
interface DataContextType {
  // ... existing
  fornecedores: Fornecedor[];
  addFornecedor: (fornecedor: Fornecedor) => void;
  updateFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  deleteFornecedor: (id: string) => void;
}

// 2. Dados iniciais (mock)
const fornecedoresIniciais: Fornecedor[] = [
  {
    id: '1',
    nome: 'Fornecedor Exemplo',
    cnpj: '12.345.678/0001-90',
    email: 'contato@fornecedor.com',
    telefone: '+1 (305) 555-0100',
    categoria: 'materiais',
    endereco: {
      rua: '123 Main St',
      cidade: 'Miami',
      estado: 'FL',
      cep: '33125'
    },
    status: 'ativo',
    dataCadastro: '2024-01-15'
  }
];

// 3. Adicionar ao Provider
export function DataProvider({ children }: { children: ReactNode }) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(fornecedoresIniciais);
  
  const addFornecedor = (fornecedor: Fornecedor) => {
    setFornecedores(prev => [...prev, fornecedor]);
  };
  
  const updateFornecedor = (id: string, updates: Partial<Fornecedor>) => {
    setFornecedores(prev => 
      prev.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  };
  
  const deleteFornecedor = (id: string) => {
    setFornecedores(prev => prev.filter(f => f.id !== id));
  };
  
  return (
    <DataContext.Provider value={{
      // ... existing
      fornecedores,
      addFornecedor,
      updateFornecedor,
      deleteFornecedor
    }}>
      {children}
    </DataContext.Provider>
  );
}
```

#### Passo 3: Criar Componente

Crie `/src/app/components/fornecedores.tsx`:

```typescript
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import type { Fornecedor } from '../types';

export default function FornecedoresView() {
  const { fornecedores, addFornecedor, updateFornecedor, deleteFornecedor } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    categoria: 'materiais' as const,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoFornecedor: Fornecedor = {
      id: Date.now().toString(),
      nome: formData.nome,
      cnpj: formData.cnpj,
      email: formData.email,
      telefone: formData.telefone,
      categoria: formData.categoria,
      endereco: {
        rua: '',
        cidade: '',
        estado: 'FL',
        cep: ''
      },
      status: 'ativo',
      dataCadastro: new Date().toISOString()
    };
    
    addFornecedor(novoFornecedor);
    toast.success('Fornecedor cadastrado com sucesso!');
    setIsDialogOpen(false);
    // Reset form
  };
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            Fornecedores
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus fornecedores de materiais e serviços
          </p>
        </div>
      </motion.div>
      
      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Fornecedores</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Fornecedor
              </Button>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Fornecedor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  {/* Form fields */}
                  <Button type="submit">Cadastrar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fornecedores.map(fornecedor => (
                <TableRow key={fornecedor.id}>
                  <TableCell>{fornecedor.nome}</TableCell>
                  <TableCell>{fornecedor.cnpj}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{fornecedor.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={fornecedor.status === 'ativo' ? 'default' : 'secondary'}>
                      {fornecedor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFornecedor(fornecedor.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Passo 4: Adicionar Rota no App.tsx

Edite `/src/app/App.tsx`:

```typescript
// 1. Importar componente
import FornecedoresView from './components/fornecedores';
import { Building2 } from 'lucide-react'; // Importar ícone

// 2. Adicionar ao tipo View
type View = 'dashboard' | 'clientes' | ... | 'fornecedores';

// 3. Adicionar ao menu
const menuItems = [
  // ... existing
  { id: 'fornecedores' as View, label: 'Fornecedores', icon: Building2 },
];

// 4. Adicionar ao switch
const renderView = () => {
  switch (activeView) {
    // ... existing cases
    case 'fornecedores': return <FornecedoresView />;
    default: return <DashboardView />;
  }
};
```

#### Passo 5: Atualizar Documentação

Adicione o novo módulo em `DOCUMENTATION.md`:

```markdown
### 12. **Fornecedores** (`fornecedores.tsx`)
**Funcionalidades:**
- ✅ CRUD completo de fornecedores
- ✅ Categorização (materiais, transporte, serviços)
- ✅ Status ativo/inativo
- ✅ Busca e filtros

**Interface:**
\`\`\`typescript
interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  // ... campos
}
\`\`\`
```

---

## 🔄 Como Adicionar uma Nova Feature

### Exemplo: Adicionar campo "Observações" ao Cliente

#### 1. Atualizar Interface

```typescript
// types/index.ts
export interface Cliente {
  // ... campos existentes
  observacoes?: string;  // ← Novo campo
}
```

#### 2. Atualizar Dados Mock (opcional)

```typescript
// context/DataContext.tsx
const clientesIniciais: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    // ... campos existentes
    observacoes: 'Cliente preferencial'  // ← Adicionar
  }
];
```

#### 3. Atualizar Formulário

```typescript
// components/clientes.tsx

// 3.1. Adicionar ao estado do form
const [formData, setFormData] = useState({
  // ... campos existentes
  observacoes: ''  // ← Novo
});

// 3.2. Adicionar campo no JSX
<div className="space-y-2">
  <Label htmlFor="observacoes">Observações</Label>
  <Textarea
    id="observacoes"
    value={formData.observacoes}
    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
    rows={3}
  />
</div>

// 3.3. Incluir no submit
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const novoCliente: Cliente = {
    // ... campos existentes
    observacoes: formData.observacoes  // ← Incluir
  };
  
  addCliente(novoCliente);
};
```

#### 4. Exibir na Listagem (opcional)

```typescript
// Adicionar coluna na tabela
<TableHead>Observações</TableHead>

// Adicionar célula
<TableCell>{cliente.observacoes || '-'}</TableCell>
```

---

## 🎨 Componentes UI

### Componentes Disponíveis

#### Button

```typescript
import { Button } from './ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Adicionar
</Button>
```

#### Card

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo do card
  </CardContent>
</Card>
```

#### Dialog (Modal)

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
    </DialogHeader>
    
    <div>
      {/* Conteúdo */}
    </div>
  </DialogContent>
</Dialog>
```

#### Input

```typescript
import { Input } from './ui/input';
import { Label } from './ui/label';

<div className="space-y-2">
  <Label htmlFor="nome">Nome</Label>
  <Input
    id="nome"
    type="text"
    placeholder="Digite o nome"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>
```

#### Select

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ativo">Ativo</SelectItem>
    <SelectItem value="inativo">Inativo</SelectItem>
  </SelectContent>
</Select>
```

#### Toast (Notification)

```typescript
import { toast } from 'sonner';

// Success
toast.success('Operação realizada com sucesso!');

// Error
toast.error('Ocorreu um erro!');

// Info
toast.info('Informação importante');

// Warning
toast.warning('Atenção!');

// Custom
toast('Mensagem customizada', {
  description: 'Descrição adicional',
  action: {
    label: 'Desfazer',
    onClick: () => console.log('Desfazer')
  }
});
```

---

## 🎨 Estilização com Tailwind

### Classes Padrão do Sistema

```typescript
// Header de página
<h1 className="flex items-center gap-3">
  <div className="p-3 bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] rounded-xl">
    <Icon className="w-8 h-8 text-white" />
  </div>
  Título da Página
</h1>

// Card com hover
<Card className="hover:shadow-lg transition-shadow cursor-pointer">

// Badge com status
<Badge variant={status === 'ativo' ? 'default' : 'secondary'}>
  {status}
</Badge>

// Botão primário
<Button className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]">

// Tabela com hover
<TableRow className="hover:bg-muted/30">
```

### Cores do Sistema

```typescript
// Azul Escuro (Primary)
className="bg-[#1E3A5F] text-white"

// Laranja (Secondary)
className="bg-[#F5A623] text-white"

// Azul Claro (Accent)
className="bg-[#5DADE2] text-white"

// Gradientes
className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]"
className="bg-gradient-to-br from-[#1E3A5F] via-[#5DADE2] to-[#F5A623]"
```

### Responsividade

```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Hidden on mobile
<div className="hidden md:block">

// Padding responsivo
<div className="p-4 md:p-6 lg:p-8">
```

### Animações com Motion

```typescript
import { motion } from 'motion/react';

// Fade in from top
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// Stagger children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
    Item 1
  </motion.div>
  <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
    Item 2
  </motion.div>
</motion.div>

// Hover effect
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

---

## 🐛 Debugging e Troubleshooting

### Problemas Comuns

#### 1. "Module not found"

```bash
# Limpar cache do node_modules
rm -rf node_modules package-lock.json
npm install

# ou
npm ci  # Clean install
```

#### 2. TypeScript Errors

```bash
# Verificar erros TypeScript
npx tsc --noEmit

# Se houver erros, verificar:
# - Imports corretos
# - Tipos definidos
# - Props tipadas
```

#### 3. Tailwind classes not working

```bash
# Verificar se o arquivo está incluído no content do Tailwind
# Ver: src/styles/tailwind.css

# Reiniciar dev server
npm run dev
```

#### 4. State not updating

```typescript
// ❌ ERRADO - Mutação
const addItem = (item) => {
  items.push(item);  // Não funciona!
  setItems(items);
};

// ✅ CORRETO - Imutável
const addItem = (item) => {
  setItems(prev => [...prev, item]);
};
```

### Ferramentas de Debug

#### React DevTools

```bash
# Instalar extensão no Chrome/Firefox
# https://react.dev/learn/react-developer-tools

# Usar para:
# - Inspecionar componentes
# - Ver props e state
# - Rastrear re-renders
```

#### Console Logs

```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug:', data);
}

// Com contexto
console.log('[ClientesView] Estado atual:', clientes);

// Table para arrays
console.table(clientes);
```

#### Performance Profiling

```typescript
import { Profiler } from 'react';

<Profiler
  id="ClientesList"
  onRender={(id, phase, actualDuration) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  }}
>
  <ClientesList />
</Profiler>
```

---

## 🔄 Git Workflow

### Branching Strategy

```
main
  ├── develop
  │   ├── feature/nova-funcionalidade
  │   ├── feature/modulo-fornecedores
  │   ├── bugfix/corrigir-validacao
  │   └── hotfix/erro-critico
```

### Workflow

```bash
# 1. Criar branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/minha-feature

# 2. Fazer alterações e commitar
git add .
git commit -m "feat: adiciona módulo de fornecedores"

# 3. Push para remote
git push origin feature/minha-feature

# 4. Criar Pull Request no GitHub
# - Base: develop
# - Compare: feature/minha-feature

# 5. Após aprovação, fazer merge
# 6. Deletar branch
git branch -d feature/minha-feature
git push origin --delete feature/minha-feature
```

### Conventional Commits

```bash
# Feature
git commit -m "feat: adiciona campo observações ao cliente"

# Fix
git commit -m "fix: corrige cálculo de horas extras"

# Docs
git commit -m "docs: atualiza guia do desenvolvedor"

# Style
git commit -m "style: formata código com prettier"

# Refactor
git commit -m "refactor: reorganiza estrutura de pastas"

# Test
git commit -m "test: adiciona testes para ClientesView"

# Chore
git commit -m "chore: atualiza dependências"
```

---

## ✅ Code Review Checklist

### Antes de Criar PR

- [ ] Código compila sem erros TypeScript
- [ ] Não há console.logs desnecessários
- [ ] Código formatado (Prettier)
- [ ] Imports organizados
- [ ] Componentes com tipos adequados
- [ ] Nomes descritivos (variáveis, funções, componentes)
- [ ] Comentários em código complexo
- [ ] Responsivo (mobile-first)
- [ ] Acessível (ARIA labels quando necessário)
- [ ] Performance otimizada (useMemo, useCallback)
- [ ] Documentação atualizada

### Checklist do Reviewer

- [ ] Código segue os padrões do projeto
- [ ] Lógica está clara e compreensível
- [ ] Não há duplicação de código
- [ ] Componentes são reutilizáveis
- [ ] Estado gerenciado corretamente
- [ ] Sem erros de TypeScript
- [ ] UI consistente com o design system
- [ ] Performance adequada
- [ ] Segurança (validação de inputs)
- [ ] Testes passando (quando aplicável)

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide/
- **Motion**: https://motion.dev/docs/react-quick-start

### Tutoriais Recomendados

- **React + TypeScript**: https://react-typescript-cheatsheet.netlify.app/
- **Tailwind Components**: https://tailwindui.com/
- **Radix UI**: https://www.radix-ui.com/primitives/docs/overview/introduction

### Comunidade

- **Discord do React**: https://discord.gg/react
- **Stack Overflow**: Tag `reactjs`, `typescript`, `tailwindcss`

---

## 🎓 Próximos Passos

1. **Configure seu ambiente** seguindo o [Setup](#setup-do-ambiente)
2. **Explore o código** começando pelo `App.tsx`
3. **Leia a arquitetura** em [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Faça sua primeira feature** seguindo este guia
5. **Faça seu primeiro PR** seguindo o [Git Workflow](#git-workflow)

---

**Dúvidas?** Entre em contato com o time!

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0
