# 📦 ITAMOVING - Sistema de Gestão de Mudanças Internacionais

<div align="center">

![ITAMOVING](https://img.shields.io/badge/ITAMOVING-Sistema_de_Gestão-1E3A5F?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-06B6D4?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite)

**Sistema completo de gerenciamento para empresas de mudanças internacionais EUA-Brasil**

[Características](#características) •
[Demo](#demo) •
[Instalação](#instalação) •
[Documentação](#documentação) •
[Tecnologias](#tecnologias) •
[Licença](#licença)

</div>

---

## 🎯 Sobre o Projeto

O **ITAMOVING** é uma aplicação web moderna e completa desenvolvida para otimizar e centralizar todas as operações de uma empresa de mudanças internacionais. O sistema oferece uma interface intuitiva e profissional para gerenciar clientes, containers, estoque, agendamentos, recursos humanos e muito mais.

### 🌟 Principais Destaques

- ✨ **Interface Moderna**: Design responsivo e animações suaves
- 🎨 **Identidade Visual**: Cores customizadas da marca ITAMOVING
- 📊 **Dashboard Analítico**: KPIs em tempo real e gráficos interativos
- 🔄 **Pipeline de Vendas**: Sistema estilo Pipedrive para gestão de leads
- 👥 **Gestão de RH**: Controle completo de funcionários, ponto e folha de pagamento
- 📦 **Gestão de Containers**: Rastreamento completo com múltiplas visualizações
- 💰 **Controle Financeiro**: Fluxo de caixa detalhado
- 📅 **Agendamentos**: Calendário interativo para coletas
- 💼 **Gestão de Clientes**: CRUD completo com dados USA e Brasil

---

## 📸 Screenshots

### Dashboard Analítico
![Dashboard](docs/screenshots/dashboard.png)

### Pipeline de Atendimentos
![Pipeline](docs/screenshots/pipeline.png)

### Gestão de RH
![RH](docs/screenshots/rh.png)

---

## 🚀 Características

### 📋 Módulos Principais

#### 1. **Dashboard**
- KPIs em tempo real (clientes, receita, agendamentos, estoque)
- Gráficos interativos (Recharts)
- Alertas inteligentes
- Timeline de atividades
- Navegação contextual

#### 2. **Gestão de Clientes**
- CRUD completo
- Dados USA e Brasil
- Busca e filtros avançados
- Status ativo/inativo
- Histórico de interações

#### 3. **Agendamentos**
- Calendário interativo (react-day-picker)
- Gestão de coletas
- Status tracking (pendente, confirmado, coletado, cancelado)
- Vinculação com clientes
- Timeline visual

#### 4. **Containers**
- Tipos: 20ft, 40ft, 40ft HC, 45ft HC
- Múltiplas visualizações (Grid, List, Kanban)
- Drag-and-drop entre status
- Rastreamento completo (origem, destino, datas)
- Gestão de caixas por cliente
- Controle de peso e volume

#### 5. **Estoque**
- Controle de caixas (Pequenas, Médias, Grandes)
- Controle de materiais (Fitas adesivas)
- Alertas de estoque baixo
- Gráficos de distribuição
- Atualização em tempo real

#### 6. **Financeiro**
- Registro de receitas e despesas
- Categorização de transações
- Métodos de pagamento
- Gráficos financeiros (Recharts)
- Cálculo automático de lucro e margem
- Vinculação com clientes

#### 7. **Pipeline de Atendimentos**
- Sistema Kanban estilo Pipedrive
- Gestão de leads do WhatsApp Bot
- Drag-and-drop entre etapas
- Filtros avançados
- Métricas em tempo real
- Sugestões de IA
- Chat do WhatsApp integrado

#### 8. **Tabela de Preços**
- Preços de entrega por cidade (rotas EUA-Brasil)
- CRUD de produtos (caixas e fitas)
- Controle de estoque de produtos
- Cálculo automático de margem de lucro
- Alertas de estoque baixo
- Status ativo/inativo

#### 9. **Recursos Humanos (RH)**
- **Gestão de Funcionários**: CRUD completo com dados pessoais e profissionais
- **Controle de Ponto**: Registro de entrada/saída com cálculo automático de horas
- **Horas Extras**: Cálculo automático quando ultrapassar 8h diárias
- **Folha de Pagamento**: Mensal com INSS, FGTS e descontos
- **Gestão de Férias**: Solicitação, aprovação e controle de períodos
- **Status**: Ativo, férias, afastado, demitido
- **Dashboard RH**: KPIs de funcionários e folha salarial

#### 10. **Relatórios**
- Relatórios pré-configurados
- Exportação de dados
- Visualizações gráficas
- Análises customizadas

---

## 🛠️ Tecnologias

### Core
- **[React 18.3.1](https://react.dev/)** - Framework UI
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Tipagem estática
- **[Vite 6.3.5](https://vitejs.dev/)** - Build tool e dev server
- **[Tailwind CSS 4.1.12](https://tailwindcss.com/)** - Framework CSS utility-first

### UI & UX
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis headless
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones
- **[Motion/React](https://motion.dev/)** - Animações fluidas (Framer Motion)
- **[Recharts](https://recharts.org/)** - Gráficos e visualizações
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Funcionalidades
- **[react-dnd](https://react-dnd.github.io/react-dnd/)** - Drag and drop
- **[react-day-picker](https://react-day-picker.js.org/)** - Calendário
- **[date-fns](https://date-fns.org/)** - Manipulação de datas
- **[react-hook-form](https://react-hook-form.com/)** - Gerenciamento de formulários

### Estado
- **React Context API** - Gerenciamento de estado global
- **useState / useMemo / useCallback** - Hooks nativos do React

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **pnpm** ou **yarn**

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/itamoving/sistema-gestao.git
   cd sistema-gestao
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   pnpm install
   # ou
   yarn install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   pnpm dev
   # ou
   yarn dev
   ```

4. **Abra no navegador**
   ```
   http://localhost:5173
   ```

### Build para Produção

```bash
# Gerar build otimizado
npm run build

# Preview do build de produção
npm run preview
```

O build será gerado na pasta `dist/`.

---

## 🔐 Autenticação

O sistema possui autenticação simulada para fins de demonstração.

### Credenciais Padrão

```
Email: admin@itamoving.com
Senha: admin123
```

> ⚠️ **Importante**: Em produção, implementar autenticação real com backend seguro (JWT, OAuth, etc).

---

## 📚 Documentação

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura completa do sistema
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentação de uso e componentes
- **[README.md](./README.md)** - Este arquivo

### Estrutura de Diretórios

```
itamoving/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes da aplicação
│   │   │   ├── agendamentos.tsx
│   │   │   ├── atendimentos.tsx
│   │   │   ├── auth.tsx
│   │   │   ├── clientes.tsx
│   │   │   ├── containers.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── estoque.tsx
│   │   │   ├── financeiro.tsx
│   │   │   ├── precos.tsx
│   │   │   ├── relatorios.tsx
│   │   │   ├── rh.tsx
│   │   │   ├── whatsapp-chat.tsx
│   │   │   └── ui/              # Componentes UI reutilizáveis
│   │   ├── context/             # Context API
│   │   │   └── DataContext.tsx
│   │   ├── types/               # TypeScript interfaces
│   │   │   └── index.ts
│   │   └── App.tsx              # Componente raiz
│   ├── styles/                  # Estilos globais
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   └── main.tsx                 # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── ARCHITECTURE.md
├── DOCUMENTATION.md
└── README.md
```

---

## 🎨 Identidade Visual

### Paleta de Cores

```css
--accent: #1E3A5F;        /* Azul Escuro - Confiança e profissionalismo */
--secondary: #F5A623;     /* Laranja - Energia e movimento */
--accent-light: #5DADE2;  /* Azul Claro - Leveza e modernidade */
```

### Tipografia

- **Fonte Principal**: Inter (Google Fonts)
- **Tamanhos**: Sistema tipográfico definido em `theme.css`

### Componentes UI

50+ componentes reutilizáveis baseados em **Radix UI**:
- Button, Card, Dialog, Input, Select, Table
- Tabs, Badge, Avatar, Calendar, Progress
- Alert, Toast, Popover, Dropdown, Accordion
- E muito mais...

---

## 🔄 Gerenciamento de Estado

### Context API

O sistema utiliza **React Context API** para gerenciar o estado global da aplicação.

```typescript
// Exemplo de uso
import { useData } from '../context/DataContext';

function MeuComponente() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useData();
  
  // CRUD operations
  const handleAdd = () => addCliente(novoCliente);
  const handleUpdate = (id) => updateCliente(id, updates);
  const handleDelete = (id) => deleteCliente(id);
  
  return <div>{/* UI */}</div>;
}
```

### Estados Gerenciados

- ✅ Clientes
- ✅ Agendamentos
- ✅ Containers
- ✅ Transações
- ✅ Estoque
- ✅ Preços de Entrega
- ✅ Preços de Produtos
- ✅ Funcionários
- ✅ Registros de Ponto
- ✅ Folhas de Pagamento
- ✅ Solicitações de Férias

---

## 📊 Dados Mockados

O sistema vem com dados de exemplo para demonstração:

- **2 Clientes** cadastrados
- **12 Containers** em diferentes status
- **2 Agendamentos** de coleta
- **2 Transações** financeiras
- **Estoque** de caixas e materiais
- **4 Rotas de preço** configuradas
- **6 Produtos** (caixas e fitas)
- **4 Funcionários** cadastrados
- **3 Registros de ponto** do dia atual
- **3 Folhas de pagamento** de dezembro/2024
- **2 Solicitações de férias**

> 💡 **Nota**: Todos os dados são armazenados em memória e resetam ao recarregar a página.

---

## 🧪 Testes

### Executar Testes

```bash
# Unit tests
npm run test

# Coverage
npm run test:coverage

# E2E tests (quando implementados)
npm run test:e2e
```

### Estratégia de Testes

- **Unit Tests**: Vitest / Jest
- **Integration Tests**: React Testing Library
- **E2E Tests**: Cypress / Playwright (planejado)

---

## 🚀 Deploy

### Opções de Deploy

#### 1. Vercel (Recomendado)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

#### 2. Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

#### 3. Docker

```bash
# Build image
docker build -t itamoving-app .

# Run container
docker run -p 80:80 itamoving-app
```

---

## 🗺️ Roadmap

### ✅ Fase 1: MVP (Completo)
- [x] Interface completa em React
- [x] CRUD de todas entidades
- [x] Estado em memória
- [x] Design system
- [x] Responsividade
- [x] 10 módulos funcionais

### 🚧 Fase 2: Backend Integration
- [ ] API REST / GraphQL
- [ ] Autenticação JWT
- [ ] Banco de dados PostgreSQL
- [ ] File storage (S3)
- [ ] React Query para cache

### 📅 Fase 3: Features Avançadas
- [ ] WebSockets (real-time)
- [ ] Push notifications
- [ ] Email service
- [ ] SMS notifications
- [ ] Background jobs

### 📱 Fase 4: Mobile
- [ ] PWA (Progressive Web App)
- [ ] React Native app
- [ ] Offline-first
- [ ] Push notifications mobile

### 🤖 Fase 5: IA & Analytics
- [ ] Business Intelligence
- [ ] Machine Learning
- [ ] Chatbot inteligente
- [ ] Recomendações automáticas

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- **Style Guide**: Airbnb React/JSX
- **Commits**: Conventional Commits
- **Branching**: Git Flow

---

## 📝 Licença

Este projeto é proprietário da **ITAMOVING** - Todos os direitos reservados.

---

## 👨‍💻 Equipe de Desenvolvimento

### Desenvolvido com

- ❤️ Paixão por código limpo
- ☕ Muito café
- 🎨 Atenção aos detalhes
- 🚀 Foco em performance

### Stack Principal

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 📞 Contato

**ITAMOVING** - Sistema de Gestão de Mudanças Internacionais

- 🌐 Website: [www.itamoving.com](https://www.itamoving.com)
- 📧 Email: contato@itamoving.com
- 📱 Telefone: +1 (305) 555-0100

---

## 🙏 Agradecimentos

- **React Team** - Pelo framework incrível
- **Vercel** - Pelo Vite e hospedagem
- **Tailwind Labs** - Pelo Tailwind CSS
- **Radix UI** - Pelos componentes acessíveis
- **Comunidade Open Source** - Por todas as bibliotecas utilizadas

---

<div align="center">

**[⬆ Voltar ao topo](#-itamoving---sistema-de-gestão-de-mudanças-internacionais)**

---

Feito com ❤️ pela equipe ITAMOVING

**Versão**: 1.0.0 | **Última atualização**: Dezembro 2024

</div>
