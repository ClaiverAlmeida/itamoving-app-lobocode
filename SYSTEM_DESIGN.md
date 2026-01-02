# 🎯 ITAMOVING - Design de Sistema

## 📋 Índice

1. [Casos de Uso](#casos-de-uso)
2. [Diagramas de Fluxo](#diagramas-de-fluxo)
3. [Modelos de Dados](#modelos-de-dados)
4. [Regras de Negócio](#regras-de-negócio)
5. [Processos de Negócio](#processos-de-negócio)
6. [Wireframes e Navegação](#wireframes-e-navegação)

---

## 🎭 Casos de Uso

### Atores do Sistema

```
┌─────────────────────────────────────────────────────┐
│                     ATORES                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👤 Administrador                                   │
│     - Acesso total ao sistema                      │
│     - Gerencia usuários                            │
│     - Configura preços                             │
│     - Gera relatórios                              │
│                                                     │
│  👤 Gerente                                         │
│     - Acesso a todos os módulos                    │
│     - Aprova férias                                │
│     - Valida transações                            │
│     - Monitora KPIs                                │
│                                                     │
│  👤 Atendente                                       │
│     - Cadastra clientes                            │
│     - Gerencia agendamentos                        │
│     - Atualiza pipeline                            │
│     - Registra containers                          │
│                                                     │
│  👤 Motorista                                       │
│     - Visualiza agendamentos                       │
│     - Atualiza status de coleta                    │
│     - Registra ponto                               │
│                                                     │
│  👤 RH / Financeiro                                 │
│     - Gerencia funcionários                        │
│     - Processa folha de pagamento                  │
│     - Controla ponto                               │
│     - Aprova férias                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### UC-01: Cadastrar Cliente

**Ator Principal**: Atendente  
**Objetivo**: Registrar novo cliente no sistema  
**Pré-condições**: Usuário autenticado com permissão

**Fluxo Principal**:
1. Atendente acessa módulo "Clientes"
2. Sistema exibe lista de clientes
3. Atendente clica em "Novo Cliente"
4. Sistema abre formulário de cadastro
5. Atendente preenche dados:
   - Dados USA (nome, CPF, telefone, endereço)
   - Dados Brasil (recebedor, CPF, endereço, telefones)
6. Atendente clica em "Cadastrar"
7. Sistema valida dados
8. Sistema salva cliente
9. Sistema exibe mensagem de sucesso
10. Sistema atualiza lista de clientes

**Fluxos Alternativos**:
- **4a. Validação falha**
  - Sistema exibe mensagens de erro
  - Atendente corrige campos
  - Retorna ao passo 6

**Pós-condições**: Cliente cadastrado e disponível no sistema

---

### UC-02: Criar Agendamento de Coleta

**Ator Principal**: Atendente  
**Objetivo**: Agendar coleta de mudança

**Fluxo Principal**:
1. Atendente acessa "Agendamentos"
2. Atendente seleciona data no calendário
3. Atendente clica em "Novo Agendamento"
4. Sistema abre formulário
5. Atendente seleciona cliente
6. Atendente preenche:
   - Data e hora da coleta
   - Endereço
   - Observações
7. Atendente confirma
8. Sistema salva agendamento
9. Sistema envia notificação (se configurado)
10. Motorista é notificado

**Regras de Negócio**:
- RN-01: Não permitir agendamentos em datas passadas
- RN-02: Verificar disponibilidade de motorista
- RN-03: Máximo de 5 agendamentos por dia por motorista

---

### UC-03: Gerenciar Container

**Ator Principal**: Atendente/Gerente  
**Objetivo**: Criar e rastrear container

**Fluxo Principal**:
1. Usuário acessa "Containers"
2. Usuário clica em "Novo Container"
3. Sistema abre formulário
4. Usuário preenche:
   - Número do container
   - Tipo (20ft, 40ft, 40ft HC, 45ft HC)
   - Origem e destino
   - Data de embarque
   - Previsão de chegada
5. Usuário adiciona caixas de clientes
6. Sistema calcula peso total
7. Sistema valida limite de peso
8. Usuário confirma
9. Sistema salva container
10. Sistema atualiza dashboard

**Regras de Negócio**:
- RN-04: Container 20ft = max 21,000 kg
- RN-05: Container 40ft = max 26,000 kg
- RN-06: Alertar quando atingir 90% da capacidade

---

### UC-04: Processar Folha de Pagamento

**Ator Principal**: RH  
**Objetivo**: Gerar folha de pagamento mensal

**Fluxo Principal**:
1. RH acessa "RH" > "Folha"
2. RH seleciona mês de referência
3. Sistema busca funcionários ativos
4. Sistema busca registros de ponto do mês
5. Para cada funcionário:
   - Calcula horas trabalhadas
   - Calcula horas extras
   - Calcula INSS (11%)
   - Calcula FGTS (8%)
   - Aplica bonificações
   - Aplica descontos
   - Calcula salário líquido
6. Sistema gera folha de pagamento
7. RH revisa valores
8. RH aprova folha
9. Sistema marca como "Pago"
10. Sistema gera relatório

**Regras de Negócio**:
- RN-07: INSS = 11% do salário base
- RN-08: FGTS = 8% do salário base
- RN-09: Hora extra = 50% adicional sobre hora normal
- RN-10: Desconto máximo de 30% do salário

---

### UC-05: Pipeline de Vendas

**Ator Principal**: Atendente  
**Objetivo**: Gerenciar leads do WhatsApp até o fechamento

**Fluxo Principal**:
1. Novo lead chega via WhatsApp Bot
2. Sistema cria card em "Novo Lead"
3. Atendente visualiza pipeline
4. Atendente arrasta card para "Qualificação"
5. Atendente preenche informações do lead
6. Atendente move para "Orçamento"
7. Atendente envia orçamento
8. Cliente responde
9. Atendente move para "Negociação"
10. Após acordo, move para "Fechado-Ganho"
11. Sistema converte lead em cliente
12. Sistema cria agendamento automático

**Regras de Negócio**:
- RN-11: Lead sem atividade por 7 dias = alertar
- RN-12: Lead em "Negociação" por >15 dias = risco de perda
- RN-13: Fechado-Ganho automaticamente cria cliente

---

## 📊 Diagramas de Fluxo

### Fluxo: Processo Completo de Mudança

```
┌────────────────────────────────────────────────────────────┐
│              PROCESSO DE MUDANÇA COMPLETO                  │
└────────────────────────────────────────────────────────────┘

[Início] Lead via WhatsApp
    ↓
┌─────────────────────┐
│ Pipeline: Novo Lead │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Qualificação       │  ← Atendente preenche dados
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Orçamento          │  ← Sistema calcula preços
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Negociação         │  ← Ajustes de preço/condições
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Fechado-Ganho      │  ← Converte em Cliente
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Cadastro Cliente    │  ← Dados completos USA/Brasil
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Agendamento Coleta  │  ← Data/hora/endereço
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Coleta Realizada    │  ← Motorista executa
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Embalagem e Prep    │  ← Caixas inventariadas
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Alocação Container  │  ← Caixas adicionadas
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Container Enviado   │  ← Status: Em Trânsito
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Chegada ao Brasil   │  ← Alfândega
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Entrega Final       │  ← Status: Entregue
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Pagamento Recebido  │  ← Transação registrada
└─────────────────────┘
    ↓
[Fim] Processo Concluído
```

### Fluxo: Controle de Ponto

```
┌────────────────────────────────────────────────────────┐
│              FLUXO DE CONTROLE DE PONTO                │
└────────────────────────────────────────────────────────┘

[Início do Dia]
    ↓
┌─────────────────┐
│ Entrada (08:00) │
└─────────────────┘
    ↓
┌─────────────────┐         ┌──────────────────┐
│ Trabalhando...  │         │ Sistema valida   │
└─────────────────┘         │ horário permitido│
    ↓                       └──────────────────┘
┌─────────────────┐
│ Saída Almoço    │  (12:00)
└─────────────────┘
    ↓
┌─────────────────┐
│ Volta Almoço    │  (13:00)
└─────────────────┘
    ↓
┌─────────────────┐         ┌──────────────────────┐
│ Trabalhando...  │         │ Se > 8h:             │
└─────────────────┘         │ - Calcula h. extras  │
    ↓                       │ - Adiciona valor     │
┌─────────────────┐         └──────────────────────┘
│ Saída (17:00)   │
└─────────────────┘
    ↓
┌─────────────────────────────┐
│ Sistema Calcula:            │
│ - Horas trabalhadas: 8h     │
│ - Tempo almoço: 1h          │
│ - Horas extras: 0h          │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Registro salvo no sistema   │
│ Disponível para folha       │
└─────────────────────────────┘
    ↓
[Fim do Dia]
```

### Fluxo: Gestão Financeira

```
┌─────────────────────────────────────────────────────┐
│           FLUXO DE GESTÃO FINANCEIRA                │
└─────────────────────────────────────────────────────┘

[Evento Financeiro]
    ↓
┌──────────────┐           ┌──────────────┐
│   RECEITA    │           │   DESPESA    │
└──────────────┘           └──────────────┘
    ↓                           ↓
┌──────────────┐           ┌──────────────┐
│ Categorias:  │           │ Categorias:  │
│ - Mudança    │           │ - Salários   │
│ - Serviços   │           │ - Materiais  │
│ - Produtos   │           │ - Transporte │
└──────────────┘           │ - Taxas      │
    ↓                      └──────────────┘
    │                           ↓
    └─────────┬─────────────────┘
              ↓
    ┌──────────────────┐
    │ Registro criado  │
    │ - Valor          │
    │ - Categoria      │
    │ - Data           │
    │ - Cliente (opt)  │
    │ - Método Pgto    │
    └──────────────────┘
              ↓
    ┌──────────────────┐
    │ Atualiza KPIs:   │
    │ - Receita Total  │
    │ - Despesa Total  │
    │ - Lucro          │
    │ - Margem         │
    └──────────────────┘
              ↓
    ┌──────────────────┐
    │ Atualiza Gráficos│
    │ - Performance    │
    │ - Categorias     │
    │ - Timeline       │
    └──────────────────┘
              ↓
    [Disponível em Relatórios]
```

---

## 📐 Modelos de Dados

### Modelo Conceitual: Cliente

```
┌────────────────────────────────────────────┐
│              CLIENTE                       │
├────────────────────────────────────────────┤
│ id: string (PK)                            │
│ nome: string                               │
│ cpf: string (UNIQUE)                       │
│ telefoneUSA: string                        │
│ email?: string                             │
│ dataCadastro: Date                         │
│ status: enum('ativo', 'inativo')           │
│ atendente: string                          │
│                                            │
│ ┌────────────────────────────────────┐    │
│ │ enderecoUSA (embedded)             │    │
│ ├────────────────────────────────────┤    │
│ │ rua: string                        │    │
│ │ numero: string                     │    │
│ │ cidade: string                     │    │
│ │ estado: string (2 chars)           │    │
│ │ zipCode: string                    │    │
│ │ complemento?: string               │    │
│ └────────────────────────────────────┘    │
│                                            │
│ ┌────────────────────────────────────┐    │
│ │ destinoBrasil (embedded)           │    │
│ ├────────────────────────────────────┤    │
│ │ nomeRecebedor: string              │    │
│ │ cpfRecebedor: string               │    │
│ │ endereco: string                   │    │
│ │ cidade: string                     │    │
│ │ estado: string (2 chars)           │    │
│ │ cep: string                        │    │
│ │ telefones: string[]                │    │
│ └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
         │
         │ 1:N
         ↓
┌────────────────────────────────────────────┐
│           AGENDAMENTO                      │
├────────────────────────────────────────────┤
│ id: string (PK)                            │
│ clienteId: string (FK)                     │
│ clienteNome: string (denorm)               │
│ dataColeta: Date                           │
│ horaColeta: string                         │
│ endereco: string                           │
│ status: enum                               │
│ observacoes?: string                       │
│ atendente: string                          │
└────────────────────────────────────────────┘
```

### Modelo Conceitual: Container

```
┌────────────────────────────────────────────┐
│             CONTAINER                      │
├────────────────────────────────────────────┤
│ id: string (PK)                            │
│ numero: string (UNIQUE)                    │
│ tipo: enum('20ft', '40ft', ...)            │
│ origem: string                             │
│ destino: string                            │
│ dataEnvio: Date                            │
│ dataEmbarque?: Date                        │
│ previsaoChegada?: Date                     │
│ status: enum                               │
│ pesoTotal: number (kg)                     │
│ limiteP: number (kg)                       │
│                                            │
│ ┌────────────────────────────────────┐    │
│ │ caixas: Array<CaixaContainer>      │    │
│ ├────────────────────────────────────┤    │
│ │ clienteId: string                  │    │
│ │ clienteNome: string                │    │
│ │ numeroCaixa: string                │    │
│ │ tamanho: string                    │    │
│ │ peso: number                       │    │
│ └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

### Modelo Conceitual: RH

```
┌────────────────────────────────────────────┐
│           FUNCIONARIO                      │
├────────────────────────────────────────────┤
│ id: string (PK)                            │
│ nome: string                               │
│ email: string (UNIQUE)                     │
│ cpf: string (UNIQUE)                       │
│ telefone: string                           │
│ dataNascimento: Date                       │
│ dataAdmissao: Date                         │
│ dataDemissao?: Date                        │
│ cargo: string                              │
│ departamento: string                       │
│ salario: number (USD)                      │
│ tipoContrato: enum                         │
│ status: enum                               │
│ supervisor?: string                        │
│ foto?: string (URL)                        │
│                                            │
│ endereco: Endereco (embedded)              │
│ documentos: Documentos (embedded)          │
│ beneficios: string[]                       │
└────────────────────────────────────────────┘
         │
         │ 1:N
         ↓
┌────────────────────────────────────────────┐
│         REGISTRO_PONTO                     │
├────────────────────────────────────────────┤
│ id: string (PK)                            │
│ funcionarioId: string (FK)                 │
│ funcionarioNome: string (denorm)           │
│ data: Date                                 │
│ entrada: Time                              │
│ saidaAlmoco?: Time                         │
│ voltaAlmoco?: Time                         │
│ saida?: Time                               │
│ horasTrabalhadas: number (calc)            │
│ horasExtras: number (calc)                 │
│ tipo: enum                                 │
│ observacoes?: string                       │
└────────────────────────────────────────────┘
         │
         │ agregação mensal
         ↓
┌────────────────────────────────────────────┐
│         FOLHA_PAGAMENTO                    │
├────────────────────────────────────────────┤
│ id: string (PK)                            │
│ mesReferencia: string (MM/YYYY)            │
│ funcionarioId: string (FK)                 │
│ funcionarioNome: string (denorm)           │
│ salarioBase: number                        │
│ horasExtras: number (calc)                 │
│ bonificacoes: number                       │
│ descontos: number                          │
│ inss: number (calc 11%)                    │
│ fgts: number (calc 8%)                     │
│ salarioLiquido: number (calc)              │
│ dataPagamento: Date                        │
│ status: enum                               │
└────────────────────────────────────────────┘
```

### Relacionamentos Principais

```
CLIENTE 1:N AGENDAMENTO
CLIENTE 1:N CAIXAS (via Container)
CLIENTE 1:N TRANSACAO

FUNCIONARIO 1:N REGISTRO_PONTO
FUNCIONARIO 1:N FOLHA_PAGAMENTO
FUNCIONARIO 1:N FERIAS

CONTAINER 1:N CAIXAS
```

---

## 🔧 Regras de Negócio

### RN-01 até RN-13 (já documentadas acima)

### RN-14: Cálculo de Preço de Entrega

```typescript
precoEntrega = (pesoTotal * precoPorKg) || precoMinimo

// Exemplo:
// Rota: Miami-SP
// Peso: 15 kg
// Preço/kg: $3.50
// Preço mínimo: $100
// 
// Cálculo: 15 * 3.50 = $52.50
// Como $52.50 < $100, cobra-se o mínimo: $100
```

### RN-15: Margem de Lucro de Produtos

```typescript
margem = ((precoVenda - precoCusto) / precoVenda) * 100

// Exemplo:
// Caixa Média
// Custo: $8.00
// Venda: $15.00
//
// Margem: ((15 - 8) / 15) * 100 = 46.67%
```

### RN-16: Alerta de Estoque Baixo

```typescript
if (estoque <= estoqueMinimo) {
  triggerAlert("Estoque baixo: " + produto.nome);
}

// Exemplo:
// Caixa Grande
// Estoque atual: 15
// Estoque mínimo: 20
// → ALERTA disparado
```

### RN-17: Status Automático de Container

```typescript
// Status progression
preparando → transito → entregue

// Regras de transição:
// preparando → transito: quando dataEmbarque é definida
// transito → entregue: quando dataChegada é registrada
```

### RN-18: Limite de Peso por Container

```typescript
const limites = {
  '20ft': 21000,    // kg
  '40ft': 26000,    // kg
  '40ft HC': 26000, // kg
  '45ft HC': 27000  // kg
};

// Validação:
if (container.pesoTotal > limites[container.tipo]) {
  throw new Error("Limite de peso excedido");
}
```

### RN-19: Prazo de Entrega

```typescript
// Baseado na rota
const prazos = {
  'Miami-SP': 45,      // dias
  'Orlando-RJ': 50,    // dias
  'Tampa-BH': 52,      // dias
  'Fort Lauderdale-DF': 48 // dias
};

// Cálculo:
dataPrevisao = dataEmbarque + prazo[rota]
```

### RN-20: Validação de CPF

```typescript
function validarCPF(cpf: string): boolean {
  // Remove pontuação
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Validação básica
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  // ... algoritmo completo
  
  return true;
}
```

---

## 🔄 Processos de Negócio

### Processo 1: Onboarding de Cliente

```
┌──────────────────────────────────────────────────────┐
│         ONBOARDING DE NOVO CLIENTE                   │
└──────────────────────────────────────────────────────┘

1. Primeiro Contato (WhatsApp/Telefone/Email)
   ↓
2. Criação de Lead no Pipeline
   │ Status: "Novo Lead"
   │ Dados: nome, telefone, cidade origem/destino
   ↓
3. Qualificação
   │ Atendente verifica:
   │ - Origem e destino atendidos?
   │ - Volume estimado
   │ - Urgência
   │ Status → "Qualificação"
   ↓
4. Orçamento
   │ Sistema calcula:
   │ - Preço por kg baseado na rota
   │ - Preço de produtos (caixas, fitas)
   │ - Prazo de entrega
   │ Atendente envia orçamento
   │ Status → "Orçamento"
   ↓
5. Negociação
   │ Ajustes de preço/condições
   │ Esclarecimento de dúvidas
   │ Status → "Negociação"
   ↓
6. Fechamento
   │ Cliente aceita proposta
   │ Status → "Fechado-Ganho"
   │ Lead convertido em Cliente
   ↓
7. Cadastro Completo
   │ Dados USA completos
   │ Dados Brasil (recebedor)
   │ Documentos
   ↓
8. Agendamento de Coleta
   │ Data e hora definidas
   │ Endereço confirmado
   │ Motorista alocado
   ↓
9. Início do Processo de Mudança
   │ → Ver "Processo Completo de Mudança"
```

### Processo 2: Ciclo de Vida do Container

```
┌──────────────────────────────────────────────────────┐
│        CICLO DE VIDA DO CONTAINER                    │
└──────────────────────────────────────────────────────┘

1. Criação
   │ Número gerado
   │ Tipo definido
   │ Status: "preparando"
   ↓
2. Preparação
   │ Adição de caixas de clientes
   │ Verificação de peso
   │ Documentação preparada
   │ Status: "preparando"
   ↓
3. Embarque
   │ Data de embarque registrada
   │ Container lacrado
   │ Documentos finalizados
   │ Status → "transito"
   ↓
4. Trânsito Marítimo
   │ Rastreamento
   │ Atualizações de posição
   │ Previsão de chegada
   │ Status: "transito"
   ↓
5. Chegada ao Brasil
   │ Desembarque
   │ Processo alfandegário
   │ Liberação
   │ Status: "transito" (até entrega final)
   ↓
6. Entrega aos Clientes
   │ Separação por cliente
   │ Agendamento de entrega
   │ Conferência de itens
   │ Status → "entregue"
   ↓
7. Finalização
   │ Container devolvido
   │ Documentação arquivada
   │ Feedback coletado
   │ Status: "entregue"
```

### Processo 3: Fechamento Mensal de RH

```
┌──────────────────────────────────────────────────────┐
│         FECHAMENTO MENSAL DE RH                      │
└──────────────────────────────────────────────────────┘

[Dia 25 do mês]
   ↓
1. Fechamento de Ponto
   │ Sistema bloqueia edições do mês
   │ RH valida todos os registros
   │ Corrige inconsistências
   ↓
2. Cálculo de Horas
   │ Para cada funcionário:
   │ - Total de horas trabalhadas
   │ - Total de horas extras
   │ - Faltas e ausências
   │ - Atestados
   ↓
3. Geração de Folha
   │ Salário base
   │ + Horas extras (50% adicional)
   │ + Bonificações
   │ - Descontos
   │ - INSS (11%)
   │ - FGTS (8%)
   │ = Salário líquido
   ↓
4. Revisão e Aprovação
   │ Gerente revisa valores
   │ Corrige se necessário
   │ Aprova folha
   ↓
5. Processamento de Pagamento
   │ [Dia 5 do mês seguinte]
   │ Transferências bancárias
   │ Status → "Pago"
   ↓
6. Geração de Holerites
   │ PDF individual por funcionário
   │ Envio por email
   │ Arquivamento
   ↓
7. Relatórios Fiscais
   │ SEFIP, GFIP, RAIS
   │ Encargos sociais
   │ Impostos
```

---

## 🎨 Wireframes e Navegação

### Mapa de Navegação

```
┌─────────────────────────────────────────────────────────┐
│                     LOGIN                               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   DASHBOARD                             │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ KPI-1    │ KPI-2    │ KPI-3    │ KPI-4    │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│  ┌─────────────────────────────────────────────┐       │
│  │          ALERTAS E NOTIFICAÇÕES             │       │
│  └─────────────────────────────────────────────┘       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Gráfico 1   │  │ Gráfico 2   │  │ Gráfico 3   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────────────────────────────────────┐       │
│  │          PRÓXIMOS AGENDAMENTOS              │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
  │
  ├─→ [CLIENTES] ────────────────────────┐
  │     │                                 │
  │     ├─→ Lista de Clientes             │
  │     ├─→ Novo Cliente (Dialog)         │
  │     ├─→ Editar Cliente (Dialog)       │
  │     └─→ Visualizar Cliente (Dialog)   │
  │                                        │
  ├─→ [AGENDAMENTOS] ───────────────────┐ │
  │     │                                │ │
  │     ├─→ Calendário                   │ │
  │     ├─→ Novo Agendamento (Dialog)    │ │
  │     └─→ Lista de Agendamentos        │ │
  │                                       │ │
  ├─→ [CONTAINERS] ────────────────────┐ │ │
  │     │                               │ │ │
  │     ├─→ View: Grid                  │ │ │
  │     ├─→ View: List                  │ │ │
  │     ├─→ View: Kanban (DnD)          │ │ │
  │     ├─→ Novo Container (Dialog)     │ │ │
  │     └─→ Detalhes Container (Dialog) │ │ │
  │                                      │ │ │
  ├─→ [ESTOQUE] ──────────────────────┐ │ │ │
  │     │                              │ │ │ │
  │     ├─→ Dashboard Estoque          │ │ │ │
  │     ├─→ Gráficos                   │ │ │ │
  │     └─→ Alertas de Estoque Baixo   │ │ │ │
  │                                     │ │ │ │
  ├─→ [FINANCEIRO] ──────────────────┐ │ │ │ │
  │     │                             │ │ │ │ │
  │     ├─→ Dashboard Financeiro      │ │ │ │ │
  │     ├─→ Nova Transação (Dialog)   │ │ │ │ │
  │     ├─→ Lista de Transações       │ │ │ │ │
  │     └─→ Gráficos Financeiros      │ │ │ │ │
  │                                    │ │ │ │ │
  ├─→ [ATENDIMENTOS] ────────────────┐│ │ │ │ │
  │     │                             ││ │ │ │ │
  │     ├─→ Pipeline Kanban (DnD)     ││ │ │ │ │
  │     ├─→ Filtros Avançados         ││ │ │ │ │
  │     ├─→ Métricas                  ││ │ │ │ │
  │     └─→ WhatsApp Chat (Dialog)    ││ │ │ │ │
  │                                    ││ │ │ │ │
  ├─→ [PREÇOS] ──────────────────────┐││ │ │ │ │
  │     │                             │││ │ │ │ │
  │     ├─→ Tab: Entregas             │││ │ │ │ │
  │     │   ├─→ Nova Rota (Dialog)    │││ │ │ │ │
  │     │   └─→ Tabela de Rotas       │││ │ │ │ │
  │     └─→ Tab: Produtos             │││ │ │ │ │
  │         ├─→ Novo Produto (Dialog) │││ │ │ │ │
  │         └─→ Tabela de Produtos    │││ │ │ │ │
  │                                    │││ │ │ │ │
  ├─→ [RH] ──────────────────────────┐│││ │ │ │ │
  │     │                             ││││ │ │ │ │
  │     ├─→ Tab: Funcionários         ││││ │ │ │ │
  │     │   ├─→ Novo Func (Dialog)    ││││ │ │ │ │
  │     │   ├─→ Editar Func (Dialog)  ││││ │ │ │ │
  │     │   └─→ Tabela Funcionários   ││││ │ │ │ │
  │     ├─→ Tab: Ponto                ││││ │ │ │ │
  │     │   ├─→ Registro Ponto (Form) ││││ │ │ │ │
  │     │   └─→ Tabela Registros      ││││ │ │ │ │
  │     ├─→ Tab: Folha                ││││ │ │ │ │
  │     │   └─→ Tabela Folhas         ││││ │ │ │ │
  │     └─→ Tab: Férias               ││││ │ │ │ │
  │         ├─→ Solicitar (Form)      ││││ │ │ │ │
  │         └─→ Tabela Solicitações   ││││ │ │ │ │
  │                                    ││││ │ │ │ │
  └─→ [RELATÓRIOS] ──────────────────┘│││ │ │ │ │
        │                              │││ │ │ │ │
        ├─→ Relatórios Pré-Definidos  │││ │ │ │ │
        ├─→ Filtros                    │││ │ │ │ │
        └─→ Exportação (PDF, Excel)    │││ │ │ │ │
```

### Estrutura de Layout Padrão

```
┌───────────────────────────────────────────────────────┐
│  HEADER                                               │
│  [Logo] ITAMOVING              [User] Admin ▼ [Logout]│
├────────┬──────────────────────────────────────────────┤
│        │                                              │
│ SIDE   │  CONTENT AREA                                │
│ BAR    │  ┌────────────────────────────────────┐      │
│        │  │ BREADCRUMB / PAGE TITLE            │      │
│ [Icon] │  └────────────────────────────────────┘      │
│ Dashbd │  ┌────────────────────────────────────┐      │
│        │  │                                    │      │
│ [Icon] │  │                                    │      │
│ Client │  │                                    │      │
│        │  │        MAIN CONTENT                │      │
│ [Icon] │  │                                    │      │
│ Estoq  │  │                                    │      │
│        │  │                                    │      │
│ [Icon] │  │                                    │      │
│ Agend  │  └────────────────────────────────────┘      │
│        │                                              │
│ [Icon] │                                              │
│ Contai │                                              │
│        │                                              │
│ ...    │                                              │
│        │                                              │
└────────┴──────────────────────────────────────────────┘
```

---

## 📊 Métricas e KPIs

### KPIs do Dashboard Principal

1. **Total de Clientes Ativos**
   - Métrica: COUNT(clientes WHERE status = 'ativo')
   - Meta: > 100
   - Alerta: < 50

2. **Agendamentos do Mês**
   - Métrica: COUNT(agendamentos WHERE mês = atual)
   - Meta: > 20
   - Alerta: < 10

3. **Receita Mensal**
   - Métrica: SUM(transacoes WHERE tipo = 'receita' AND mês = atual)
   - Meta: > $50,000
   - Alerta: < $30,000

4. **Estoque Crítico**
   - Métrica: COUNT(produtos WHERE estoque < estoqueMinimo)
   - Meta: = 0
   - Alerta: > 0

### KPIs do Pipeline de Vendas

1. **Taxa de Conversão**
   - Métrica: (Fechado-Ganho / Total Leads) * 100
   - Meta: > 25%

2. **Tempo Médio no Pipeline**
   - Métrica: AVG(dataFechamento - dataCriacao)
   - Meta: < 15 dias

3. **Valor Médio do Deal**
   - Métrica: AVG(valorDeal WHERE status = 'Fechado-Ganho')
   - Meta: > $3,000

### KPIs de RH

1. **Taxa de Absenteísmo**
   - Métrica: (Dias de falta / Dias úteis) * 100
   - Meta: < 3%

2. **Horas Extras Mensais**
   - Métrica: SUM(horasExtras)
   - Meta: < 10% do total de horas

3. **Folha de Pagamento / Receita**
   - Métrica: (Total folha / Total receita) * 100
   - Meta: < 30%

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Autor**: Equipe ITAMOVING
