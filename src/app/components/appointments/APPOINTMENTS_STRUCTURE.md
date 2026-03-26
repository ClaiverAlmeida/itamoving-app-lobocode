# Estrutura Padrão do Módulo `appointments`

Este documento define o padrão de organização do módulo `appointments`.

Objetivo: manter o arquivo de tela principal como **container/orquestrador** e distribuir responsabilidades em arquivos menores e previsíveis.

> Observação: nem todo módulo precisará de todos os arquivos descritos aqui.  
> A ideia é usar esta estrutura como referência e aplicar apenas o que fizer sentido.

---

## 1) Estrutura de pastas (referência)

```txt
appointments/
  appointments.constants.ts
  appointments.utils.ts
  appointments.crud.ts
  appointments.handlers.ts
  hooks/
    useAppointmentsForms.ts
    useAppointmentsDateGetters.ts
  components/
    index.tsx
    AppointmentListItemCard.tsx
    AppointmentsListView.tsx
    AppointmentsDialogs.tsx
    AppointmentsSidePanel.tsx
    AppointmentsCreatePeriodForm.tsx
    AppointmentsCreateAppointmentForm.tsx
    AppointmentsEditAppointmentDialog.tsx
    AppointmentsTimelineView.tsx
    AppointmentsPeriodSidePanelContent.tsx
    AppointmentsSelectedAppointmentContent.tsx
    AppointmentsMetricsCards.tsx
    AppointmentsContentView.tsx
  index.tsx
```

---

## 2) Responsabilidades por tipo de arquivo

- `appointments.tsx` (fora da pasta, arquivo de tela):
  - container principal;
  - estado da tela e composição de componentes;
  - sem blocos grandes de JSX e sem regras pesadas inline.

- `appointments.constants.ts`:
  - constantes de domínio e UI;
  - mapeamentos e enums normalizados (ex.: status).

- `appointments.utils.ts`:
  - utilitários puros e reutilizáveis;
  - sem efeitos colaterais.

- `appointments.crud.ts`:
  - camada de acesso aos serviços/api do módulo;
  - interface simples para consumo do container/handlers.

- `appointments.handlers.ts`:
  - regras de ação (create/update/delete/status etc.);
  - validações de negócio e mensagens de feedback;
  - sem JSX.

- `hooks/`:
  - estado derivado e lógica de composição por tema (ex.: forms, getters de datas);
  - agrupamento por contexto funcional, não por tamanho.

- `components/`:
  - blocos visuais e subárvores de UI;
  - componentes focados e com props claras;
  - cada componente com responsabilidade única.

- `index.tsx` (raiz do módulo) e `components/index.tsx`:
  - barrel files para centralizar exports;
  - evitar imports profundos em consumidores.

---

## 3) Convenções adotadas

- **Container-first**: a tela principal só orquestra.
- **Single responsibility**: cada arquivo resolve um tipo de problema.
- **Imports limpos**: remover sempre o que não for usado.
- **Barrel exports**: preferir imports via `appointments/index`.
- **Nomenclatura**:
  - componentes: `PascalCase`;
  - hooks: `useXxx`;
  - handlers: `handleXxx` (arquivo utilitário) e wrappers curtos no container quando necessário.

---

## 4) Quando criar um novo arquivo

Criar um novo arquivo quando houver:

- bloco JSX grande e reutilizável;
- regra de negócio que não é de renderização;
- função utilitária pura usada em mais de um ponto;
- agrupamento de estado derivado que pode virar hook.

Evitar criar arquivo novo quando:

- é lógica muito local e curta;
- extração piora legibilidade por fragmentação excessiva.

---

## 5) Checklist para novos módulos

- [ ] Tela principal está como container?
- [ ] Constantes estão em arquivo próprio?
- [ ] Handlers de ação estão fora do JSX?
- [ ] Hooks separam lógica de formulário/derivações?
- [ ] Componentes grandes foram quebrados?
- [ ] Há barrel `index.tsx` no módulo?
- [ ] Não há imports não utilizados?

