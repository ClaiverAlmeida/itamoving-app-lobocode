import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Caixa, DriverUser, Item, OrdemServicoMotorista, PrecoProduto } from "../../../api";
import { buildServiceOrderPayload } from "./service-order-form.payload";
import { caixaTemTodosCamposPreenchidos, isCaixaPersonalizada, isFitaAdesiva, obterTipoProdutoDaCaixa } from "./service-order-form.verifications";
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "../../stock";
import { serviceOrderFormCrud } from "./service-order-form.crud";

type Params = {
  isEditMode: boolean;
  appointmentId: string;
  existingOrdem: any;
  user: { id?: string; nome?: string; role?: string } | null;
  onClose: () => void;
  onSave?: (ordem: any) => void;
  onAgendamentosAtualizados?: () => void | Promise<void>;
  hydrationReady: boolean;
  motoristasLoading: boolean;
  produtosLoading: boolean;
  motoristas: DriverUser[];
  motoristaResponsavel: string;
  motoristaResponsavelNome?: string;
  ordemStatus: OrdemServicoMotorista["status"];
  ordemObservacoes: string;
  valorPago: string;
  assinaturaCliente: string;
  assinaturaAgente: string;
  remetenteNome: string;
  remetenteTel: string;
  remetenteCpfRg: string;
  remetenteEndereco: string;
  remetenteNumero: string;
  remetenteCidade: string;
  remetenteEstado: string;
  remetenteZipCode: string;
  remetenteComplemento: string;
  destinatarioNome: string;
  destinatarioCpfRg: string;
  destinatarioEndereco: string;
  destinatarioBairro: string;
  destinatarioCidade: string;
  destinatarioEstado: string;
  destinatarioCep: string;
  destinatarioTelefone: string;
  destinatarioNumero: string;
  destinatarioComplemento: string;
  observations: string;
  caixas: Caixa[];
  itens: Item[];
  opcoesCaixa: PrecoProduto[];
  existingProductIds: Set<string>;
};

export function useServiceOrderFormSave(params: Params) {
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);

  useEffect(() => {
    setInitialSnapshot(null);
  }, [params.existingOrdem?.id]);

  const editSnapshot = useMemo(() => {
    if (!params.isEditMode) return null;
    return JSON.stringify({
      remetente: {
        usaName: params.remetenteNome,
        usaPhone: params.remetenteTel,
        usaCpf: params.remetenteCpfRg,
        usaAddress: {
          rua: params.remetenteEndereco,
          numero: params.remetenteNumero,
          cidade: params.remetenteCidade,
          estado: params.remetenteEstado,
          zipCode: params.remetenteZipCode,
          complemento: params.remetenteComplemento,
        },
      },
      destinatario: {
        brazilName: params.destinatarioNome,
        brazilCpf: params.destinatarioCpfRg,
        brazilPhone: params.destinatarioTelefone,
        brazilAddress: {
          rua: params.destinatarioEndereco,
          bairro: params.destinatarioBairro,
          cidade: params.destinatarioCidade,
          estado: params.destinatarioEstado,
          cep: params.destinatarioCep,
          complemento: params.destinatarioComplemento,
          numero: params.destinatarioNumero,
        },
      },
      ordem: {
        status: params.ordemStatus,
        observations: params.ordemObservacoes.trim(),
        chargedValue: params.valorPago,
      },
      motoristaResponsavel: params.motoristaResponsavel,
      assinaturas: {
        clientSignature: params.assinaturaCliente.trim(),
        agentSignature: params.assinaturaAgente.trim(),
      },
      caixas: params.caixas.map((c) => ({ id: c.id, type: c.type, value: c.value, weight: c.weight })),
      itens: params.itens.map((i) => ({
        id: i.id,
        caixaId: i.caixaId,
        name: i.name,
        quantity: i.quantity,
        weight: i.weight,
        observations: i.observations ?? "",
      })),
    });
  }, [params]);

  const isDirty = useMemo(() => {
    if (!params.isEditMode) return true;
    if (!initialSnapshot || !editSnapshot) return false;
    return editSnapshot !== initialSnapshot;
  }, [params.isEditMode, initialSnapshot, editSnapshot]);

  const canSave = useMemo(() => {
    if (!params.isEditMode) return true;
    return Boolean(initialSnapshot) && Boolean(editSnapshot) && isDirty;
  }, [params.isEditMode, initialSnapshot, editSnapshot, isDirty]);

  useEffect(() => {
    if (!params.isEditMode || !params.existingOrdem?.id || !params.hydrationReady) return;
    if (params.motoristasLoading || params.produtosLoading || initialSnapshot || !editSnapshot) return;
    const expectedClientSig = String(params.existingOrdem.clientSignature ?? "").trim();
    const expectedAgentSig = String(params.existingOrdem.agentSignature ?? "").trim();
    if (params.assinaturaCliente.trim() !== expectedClientSig) return;
    if (params.assinaturaAgente.trim() !== expectedAgentSig) return;
    const expectedCaixasCount = params.existingOrdem.driverServiceOrderProducts?.length ?? 0;
    if (params.caixas.length !== expectedCaixasCount) return;
    const expectedItensCount = (params.existingOrdem.driverServiceOrderProducts ?? []).reduce((sum, p) => sum + (p.driverServiceOrderProductsItems?.length ?? 0), 0);
    if (params.itens.length !== expectedItensCount) return;
    let expectedMotoristaId = params.existingOrdem.userId || "";
    if (params.motoristas.length) {
      const matchByName = params.motoristas.find((m) => m.name === params.existingOrdem?.driverName);
      if (matchByName) expectedMotoristaId = matchByName.id;
    }
    if (params.motoristaResponsavel !== expectedMotoristaId) return;
    setInitialSnapshot(editSnapshot);
  }, [params, initialSnapshot, editSnapshot]);

  const salvarOrdemServico = async () => {
    if (params.isEditMode && !canSave) return toast.info("Nenhum campo alterado.");
    if (!params.remetenteNome || !params.remetenteTel || !params.remetenteEndereco || !params.remetenteNumero || !params.remetenteCidade || !params.remetenteEstado || !params.remetenteZipCode || !params.remetenteComplemento) {
      return toast.error("Preencha todos os campos obrigatorios do remetente");
    }
    if (!params.destinatarioNome || !params.destinatarioCpfRg || !params.destinatarioEndereco || !params.destinatarioBairro || !params.destinatarioCidade || !params.destinatarioEstado || !params.destinatarioCep || !params.destinatarioTelefone || !params.destinatarioNumero || !params.destinatarioComplemento) {
      return toast.error("Preencha todos os campos obrigatorios do destinatario");
    }
    if (params.caixas.length === 0) return toast.error("Adicione pelo menos uma caixa ou produto");
    if (params.caixas.some((c) => !caixaTemTodosCamposPreenchidos(c))) return toast.error("Preencha todos os campos das caixas ou produtos antes de salvar");
    const caixaSemItensObrigatorios = params.caixas.some((c) => {
      if (isFitaAdesiva(c, params.opcoesCaixa) || isCaixaPersonalizada(c, params.opcoesCaixa)) return false;
      return params.itens.filter((i) => i.caixaId === c.id).length === 0;
    });
    if (caixaSemItensObrigatorios) return toast.error("Cada caixa precisa ter ao menos 1 item (fita adesiva e caixa personalizada nao exigem itens)");
    const itemInvalido = params.itens.some((i) => !String(i.name ?? "").trim() || Number(i.quantity) <= 0 || Number(i.weight) <= 0);
    if (itemInvalido) return toast.error("Preencha todos os campos dos itens antes de salvar");

    const assinaturaClienteFinal = params.assinaturaCliente?.trim() || (params.isEditMode ? (params.existingOrdem?.clientSignature ?? "") : "");
    const assinaturaAgenteFinal = params.assinaturaAgente?.trim() || (params.isEditMode ? (params.existingOrdem?.agentSignature ?? "") : "");
    if (!assinaturaClienteFinal) return toast.error("E necessaria a assinatura do cliente");
    if (!assinaturaAgenteFinal) return toast.error("E necessaria a assinatura do agente");
    if ((params.ordemStatus === "COMPLETED" || !params.isEditMode) && Number(params.valorPago) <= 0) return toast.error(params.isEditMode ? "Para ordem concluida, informe o valor recebido." : "O valor pago deve ser maior que 0");

    const criandoComoMotorista = !params.isEditMode && params.user?.role === "motorista";
    let idMotoristaResponsavel = "";
    if (criandoComoMotorista) {
      idMotoristaResponsavel = String(params.user?.id ?? "").trim();
      if (!idMotoristaResponsavel) return toast.error("Sessao invalida. Faca login novamente.");
    } else {
      if (params.motoristasLoading) return toast.error("Aguarde o carregamento da lista de motoristas.");
      if (!params.motoristas.length) return toast.error("Nao ha motoristas disponiveis. Tente novamente em instantes.");
      idMotoristaResponsavel = String(params.motoristaResponsavel ?? "").trim();
      if (!idMotoristaResponsavel) return toast.error("Selecione um motorista responsavel");
      const motoristaNaLista = params.motoristas.some((m) => m.id === idMotoristaResponsavel);
      const motoristaEhUsuarioLogado = params.isEditMode && params.user?.role === "motorista" && idMotoristaResponsavel === params.user?.id;
      if (!motoristaNaLista && !motoristaEhUsuarioLogado) return toast.error("Selecione um motorista valido na lista.");
    }

    const payload = buildServiceOrderPayload({
      appointmentId: params.appointmentId,
      remetenteNome: params.remetenteNome,
      remetenteTel: params.remetenteTel,
      remetenteCpfRg: params.remetenteCpfRg,
      remetenteEndereco: params.remetenteEndereco,
      remetenteNumero: params.remetenteNumero,
      remetenteCidade: params.remetenteCidade,
      remetenteEstado: params.remetenteEstado,
      remetenteZipCode: params.remetenteZipCode,
      remetenteComplemento: params.remetenteComplemento,
      destinatarioNome: params.destinatarioNome,
      destinatarioCpfRg: params.destinatarioCpfRg,
      destinatarioEndereco: params.destinatarioEndereco,
      destinatarioBairro: params.destinatarioBairro,
      destinatarioCidade: params.destinatarioCidade,
      destinatarioEstado: params.destinatarioEstado,
      destinatarioCep: params.destinatarioCep,
      destinatarioComplemento: params.destinatarioComplemento,
      destinatarioNumero: params.destinatarioNumero,
      destinatarioTelefone: params.destinatarioTelefone,
      caixas: params.caixas,
      itens: params.itens,
      opcoesCaixa: params.opcoesCaixa,
      existingProductIds: params.existingProductIds,
      assinaturaClienteFinal,
      assinaturaAgenteFinal,
      driverName: params.isEditMode ? (params.motoristaResponsavelNome || params.existingOrdem?.driverName || params.user?.nome || "Motorista") : (criandoComoMotorista ? (params.user?.nome || "Motorista") : (params.motoristaResponsavelNome || "Motorista")),
      userId: idMotoristaResponsavel,
      status: criandoComoMotorista ? "COMPLETED" : params.ordemStatus,
      valorPago: params.valorPago,
      observations: !params.isEditMode ? params.observations : params.ordemObservacoes.trim() || undefined,
    });

    if (!params.isEditMode || !params.existingOrdem?.id) {
      const created = await serviceOrderFormCrud.create(payload);
      if (created.success && created.data) {
        params.onClose();
        void Promise.resolve(params.onAgendamentosAtualizados?.()).catch(() => {});
        params.onSave?.(created.data);
        toast.success("Ordem de servico salva com sucesso!");
      }
      return;
    }

    if (!initialSnapshot || !editSnapshot) return toast.info("Nenhum campo alterado.");

    let initialObj: any = null;
    let currentObj: any = null;
    try {
      initialObj = JSON.parse(initialSnapshot);
      currentObj = JSON.parse(editSnapshot);
    } catch {
      return toast.error("Erro ao comparar campos alterados. Tente novamente.");
    }

    const patch: Partial<OrdemServicoMotorista> = {};
    const remetenteChanged = JSON.stringify(currentObj?.remetente) !== JSON.stringify(initialObj?.remetente);
    const destinatarioChanged = JSON.stringify(currentObj?.destinatario) !== JSON.stringify(initialObj?.destinatario);
    const statusChanged = currentObj?.ordem?.status !== initialObj?.ordem?.status;
    const observationsChanged = currentObj?.ordem?.observations !== initialObj?.ordem?.observations;
    const chargedValueChanged = currentObj?.ordem?.chargedValue !== initialObj?.ordem?.chargedValue;
    const clientSignatureChanged = currentObj?.assinaturas?.clientSignature !== initialObj?.assinaturas?.clientSignature;
    const agentSignatureChanged = currentObj?.assinaturas?.agentSignature !== initialObj?.assinaturas?.agentSignature;
    const motoristaChanged = String(currentObj?.motoristaResponsavel ?? "").trim() !== String(initialObj?.motoristaResponsavel ?? "").trim();
    const caixasChanged = JSON.stringify(currentObj?.caixas) !== JSON.stringify(initialObj?.caixas);
    const itensChanged = JSON.stringify(currentObj?.itens) !== JSON.stringify(initialObj?.itens);

    if (remetenteChanged) patch.sender = payload.sender;
    if (destinatarioChanged) patch.recipient = payload.recipient;
    if (statusChanged) patch.status = payload.status;
    if (observationsChanged) patch.observations = currentObj?.ordem?.observations ?? "";
    if (chargedValueChanged) patch.chargedValue = payload.chargedValue;
    if (motoristaChanged) {
      patch.userId = payload.userId;
      patch.driverName = payload.driverName;
    }
    if (clientSignatureChanged) patch.clientSignature = payload.clientSignature;
    if (agentSignatureChanged) patch.agentSignature = payload.agentSignature;
    if (clientSignatureChanged || agentSignatureChanged) patch.signatureDate = payload.signatureDate;

    if (caixasChanged || itensChanged) {
      const initialCaixas: Array<any> = initialObj?.caixas ?? [];
      const currentCaixas: Array<any> = currentObj?.caixas ?? [];
      const initialItens: Array<any> = initialObj?.itens ?? [];
      const currentItens: Array<any> = currentObj?.itens ?? [];

      const initialCaixaById = new Map<string, any>(initialCaixas.map((c: any) => [String(c.id), c]));
      const sortItems = (arr: Array<any>) => [...arr].sort((a, b) => String(a.id ?? "").localeCompare(String(b.id ?? "")));
      const getItemsByCaixaId = (arr: Array<any>, caixaId: string) => sortItems(arr.filter((i: any) => String(i.caixaId) === caixaId));

      const changedCaixaIds = new Set<string>();
      for (const cur of currentCaixas) {
        const curId = String(cur.id);
        const init = initialCaixaById.get(curId);
        if (!init) {
          changedCaixaIds.add(curId);
          continue;
        }
        const caixaDiff = cur.type !== init.type || cur.value !== init.value || cur.weight !== init.weight;
        if (caixaDiff) {
          changedCaixaIds.add(curId);
          continue;
        }
        const initItems = getItemsByCaixaId(initialItens, curId);
        const curItems = getItemsByCaixaId(currentItens, curId);
        if (JSON.stringify(curItems) !== JSON.stringify(initItems)) changedCaixaIds.add(curId);
      }

      const currentCaixaIdSet = new Set(currentCaixas.map((c: any) => String(c.id)));
      const removedBackendProductIds = initialCaixas
        .map((c: any) => String(c.id))
        .filter((bid) => params.existingProductIds.has(bid) && !currentCaixaIdSet.has(bid));
      if (removedBackendProductIds.length) patch.deletedDriverServiceOrderProductIds = removedBackendProductIds;

      if (changedCaixaIds.size) {
        patch.driverServiceOrderProducts = params.caixas
          .filter((c) => changedCaixaIds.has(String(c.id)))
          .map((c) => ({
            ...(params.existingProductIds.has(c.id) ? { id: c.id } : {}),
            type: `${c.type} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[obterTipoProdutoDaCaixa(c, params.opcoesCaixa) as keyof typeof PRODUCT_TYPE_TO_ITEM_KEY]]}`,
            value: c.value,
            weight: c.weight,
            driverServiceOrderProductsItems: params.itens
              .filter((i) => i.caixaId === c.id)
              .map((i) => ({
                id: i.id,
                name: i.name,
                quantity: Number(i.quantity) || 0,
                weight: Number(i.weight) || 0,
                observations: i.observations ?? "",
              })),
          }));
      }
    }

    if (Object.keys(patch).length > 0) {
      patch.userId = payload.userId;
      patch.driverName = payload.driverName;
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) delete (patch as any)[k];
    }
    if (Object.keys(patch).length === 0) return toast.info("Nenhum campo alterado.");

    const result = await serviceOrderFormCrud.update(params.existingOrdem.id, patch);
    if (result.success && result.data) {
      params.onSave?.(result.data);
      void Promise.resolve(params.onAgendamentosAtualizados?.()).catch(() => {});
      toast.success("Ordem de servico atualizada com sucesso!");
      params.onClose();
      return;
    }
    toast.error(result.error || "Erro ao atualizar ordem de servico");
  };

  return { canSave, salvarOrdemServico };
}

