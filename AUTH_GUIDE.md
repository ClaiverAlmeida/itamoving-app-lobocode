# 🔐 Guia de Autenticação e Hierarquia de Acessos - ITAMOVING

## 📋 Visão Geral

O sistema ITAMOVING implementa um robusto sistema de autenticação e autorização com 4 níveis de acesso hierárquicos, cada um com permissões específicas para garantir segurança e controle de dados.

---

## 👥 Perfis de Usuário

### 1️⃣ **Admin Geral** 🔑
**Acesso Total ao Sistema**

- ✅ **Permissões**: Acesso completo a todos os módulos (leitura e escrita)
- 📊 **Módulos Disponíveis**:
  - Dashboard
  - Clientes (CRUD completo)
  - Estoque (CRUD completo)
  - Agendamentos (CRUD completo)
  - Containers (CRUD completo)
  - Financeiro (CRUD completo)
  - Relatórios (Geração e exportação)
  - Atendimentos/Pipeline (CRUD completo)
  - Preços (CRUD completo)
  - RH (CRUD completo)
  - Motorista (Visualização e gerenciamento)

**Credenciais Demo:**
```
Email: admin@itamoving.com
Senha: Admin123@Senha
```

---

### 2️⃣ **Comercial** 💼
**Foco em Vendas e Atendimento**

- ✅ **Permissões de Escrita**:
  - Cadastro de Clientes
  - Agendamentos
  - Estoque (controle de inventário)
  - Atendimentos/Pipeline (gerenciamento de leads)
  
- 👁️ **Permissões de Leitura**:
  - Containers
  - Financeiro
  - Relatórios
  - Rotas

- ❌ **Sem Acesso**:
  - RH
  - Módulo de Motorista

**Credenciais Demo:**
```
Email: comercial@itamoving.com
Senha: Comercial123@Senha
```

---

### 3️⃣ **Logístico (Raquel)** 📦
**Gestão de Operações e Logística**

- ✅ **Permissões de Escrita**:
  - Agendamentos
  - Containers
  - Rotas

- 👁️ **Permissões SOMENTE LEITURA**:
  - **Estoque** (visualização de dados, sem edição)

- ❌ **Sem Acesso**:
  - Clientes
  - Financeiro
  - Relatórios
  - Atendimentos/Pipeline
  - RH
  - Módulo de Motorista

**⚠️ Característica Especial:**
O perfil Logístico recebe um indicador visual "**Modo Somente Leitura**" no módulo de Estoque, informando que pode visualizar mas não pode fazer alterações.

**Credenciais Demo:**
```
Email: raquel@itamoving.com
Senha: raquel123
```

---

### 4️⃣ **Motorista** 🚚
**Interface Simplificada para Entregas**

- ✅ **Acesso Exclusivo ao Módulo Motorista** com:
  - 📋 **Ordens de Serviço** (visualização)
  - 📦 **Quantidade de Caixas** (visualização do estoque no caminhão)
  - 💵 **Recibo de Pagamento** (emissão)
  - ✍️ **Assinatura Digital do Cliente**
  - 💰 **Registro de Pagamento em Espécie**
  - 🖨️ **Impressão de Cupom Fiscal**

- 👁️ **Permissões de Leitura**:
  - Agendamentos (suas entregas)
  - Estoque (quantidade de caixas disponíveis)
  - Rotas

- ❌ **Sem Acesso**:
  - Todos os outros módulos administrativos

**Credenciais Demo:**
```
Email: motorista@itamoving.com
Senha: Motorista123@Senha
```

---

## 🛠️ Funcionalidades Especiais do Módulo Motorista

### 📱 Interface Intuitiva para Entregas

1. **Lista de Ordens de Serviço**
   - Visualização de todas as entregas do dia
   - Informações do cliente e endereços
   - Quantidade detalhada de caixas (P, M, G)

2. **Detalhes da Ordem**
   - Informações completas do cliente
   - Endereço de coleta e entrega
   - Inventário de caixas separado por tamanho
   - Observações especiais

3. **Processo de Finalização**
   - 💵 Campo para inserir valor pago em espécie
   - ✍️ Canvas para assinatura digital do cliente
   - ✅ Validação de campos obrigatórios

4. **Recibo de Entrega**
   - 📄 Documento profissional com logo ITAMOVING
   - 📋 Detalhamento completo dos itens entregues
   - 💰 Valor pago em espécie
   - ✍️ Assinatura digital capturada
   - 🖨️ Função de impressão

---

## 🔒 Sistema de Permissões

### Estrutura de Permissões

```typescript
interface Permission {
  clientes: { read: boolean; write: boolean };
  agendamentos: { read: boolean; write: boolean };
  estoque: { read: boolean; write: boolean };
  containers: { read: boolean; write: boolean };
  financeiro: { read: boolean; write: boolean };
  relatorios: { read: boolean; write: boolean };
  atendimentos: { read: boolean; write: boolean };
  rh: { read: boolean; write: boolean };
  rotas: { read: boolean; write: boolean };
  motorista: { read: boolean; write: boolean };
}
```

### Tabela de Permissões

| Módulo        | Admin | Comercial | Logístico | Motorista |
|---------------|-------|-----------|-----------|-----------|
| Clientes      | ✏️ R/W | ✏️ R/W     | ❌         | ❌         |
| Agendamentos  | ✏️ R/W | ✏️ R/W     | ✏️ R/W     | 👁️ R      |
| Estoque       | ✏️ R/W | ✏️ R/W     | 👁️ R      | 👁️ R      |
| Containers    | ✏️ R/W | 👁️ R      | ✏️ R/W     | ❌         |
| Financeiro    | ✏️ R/W | 👁️ R      | ❌         | ❌         |
| Relatórios    | ✏️ R/W | 👁️ R      | ❌         | ❌         |
| Atendimentos  | ✏️ R/W | ✏️ R/W     | ❌         | ❌         |
| RH            | ✏️ R/W | ❌         | ❌         | ❌         |
| Rotas         | ✏️ R/W | 👁️ R      | ✏️ R/W     | 👁️ R      |
| Motorista     | ✏️ R/W | ❌         | ❌         | ✏️ R/W     |

**Legenda:**
- ✏️ R/W = Leitura e Escrita (Full Access)
- 👁️ R = Somente Leitura (Read Only)
- ❌ = Sem Acesso

---

## 🚀 Como Usar

### 1. Tela de Login

O sistema apresenta uma tela de login profissional com:
- 🎨 Design moderno com gradientes nas cores da marca ITAMOVING
- 🔐 Formulário de login seguro
- ⚡ Botões de acesso rápido para demonstração
- 📝 Lista de credenciais disponíveis

### 2. Navegação Adaptativa

- O menu lateral se adapta automaticamente às permissões do usuário
- Motoristas veem apenas o módulo de Entregas
- Indicadores visuais mostram o nível de acesso (badges coloridos)

### 3. Proteção de Rotas

- Tentativas de acesso a módulos sem permissão mostram tela de "Acesso Negado"
- Redirecionamento automático para áreas permitidas

### 4. Indicadores Visuais

- **Badge de Perfil**: Mostra o tipo de usuário (Admin, Comercial, Logístico, Motorista)
- **Avatar Personalizado**: Cada usuário tem um avatar único
- **Modo Somente Leitura**: Indicador especial para módulos com restrição de escrita

---

## 💾 Persistência de Sessão

- ✅ Login mantido após refresh da página
- ✅ Dados salvos no localStorage
- ✅ Logout limpa completamente a sessão
- ✅ Segurança: senhas não são armazenadas

---

## 🎯 Casos de Uso

### Fluxo do Comercial
1. Login no sistema
2. Acesso ao Pipeline de Atendimentos
3. Criação de novos leads do WhatsApp
4. Conversão de leads em clientes
5. Criação de agendamentos
6. Visualização de relatórios de vendas

### Fluxo do Logístico (Raquel)
1. Login no sistema
2. Gerenciamento de agendamentos
3. **Visualização** do estoque (sem edição)
4. Controle de containers
5. Planejamento de rotas
6. Acompanhamento de entregas

### Fluxo do Motorista
1. Login no sistema
2. Visualização das ordens de serviço do dia
3. Verificação do estoque de caixas no caminhão
4. Iniciar entrega
5. Coletar assinatura do cliente
6. Registrar pagamento em espécie
7. Gerar e imprimir recibo

---

## 🔧 Componentes Técnicos

### AuthContext
- Gerenciamento centralizado de autenticação
- Hook `useAuth()` para acesso em qualquer componente
- Função `hasPermission()` para validação de permissões

### PermissionWrapper
- Componente para proteger conteúdo baseado em permissões
- Suporte a fallback customizado
- Badge automático para modo somente leitura

### Login Component
- Design responsivo e moderno
- Validação de credenciais
- Feedback visual de erros
- Acesso rápido para demonstração

### Motorista App
- Interface dedicada e simplificada
- Canvas para assinatura digital
- Formatação automática de valores
- Geração de recibos imprimíveis

---

## 🎨 Design

O sistema segue o design system da ITAMOVING:
- **Azul Escuro**: `#1E3A5F` - Primário
- **Laranja**: `#F5A623` - Destaque
- **Azul Claro**: `#5DADE2` - Secundário

Badges de perfil coloridos:
- 🟣 Admin: Roxo
- 🔵 Comercial: Azul
- 🟢 Logístico: Verde
- 🟠 Motorista: Laranja

---

## 📄 Segurança

✅ **Implementado:**
- Controle de acesso baseado em roles
- Validação de permissões em cada módulo
- Proteção de rotas
- Sessão persistente segura
- Logout completo

⚠️ **Nota de Produção:**
Este é um sistema de demonstração com autenticação mock. Para produção, integrar com:
- Backend com JWT
- Autenticação OAuth/SAML
- Criptografia de senhas
- Rate limiting
- Auditoria de acessos

---

## 🚦 Status do Sistema

✅ **Concluído:**
- [x] Sistema de autenticação
- [x] Hierarquia de 4 níveis
- [x] Controle de permissões
- [x] Tela de login profissional
- [x] Módulo exclusivo para motoristas
- [x] Assinatura digital
- [x] Geração de recibos
- [x] Indicadores visuais de acesso
- [x] Proteção de rotas
- [x] Persistência de sessão

---

## 📞 Suporte

Para dúvidas sobre o sistema de autenticação, consulte:
- `DEVELOPER_GUIDE.md` - Guia técnico completo
- `ARCHITECTURE.md` - Arquitetura do sistema
- `/src/app/context/AuthContext.tsx` - Código do AuthContext
- `/src/app/components/login.tsx` - Componente de Login
- `/src/app/components/motorista-app.tsx` - Módulo do Motorista

---

**© 2025 ITAMOVING - Sistema de Gerenciamento de Mudanças Internacionais EUA-Brasil**