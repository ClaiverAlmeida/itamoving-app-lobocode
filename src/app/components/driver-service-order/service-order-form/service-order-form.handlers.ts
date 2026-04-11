import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { toast } from "sonner";
import type { Caixa, DriverUser, Item, DriverServiceOrder, ProductPrice } from "../../../api";
import { serviceOrderFormService } from "../../../api";
import { buildDriverServiceOrderProducts, buildServiceOrderPayload } from "./service-order-form.payload";
import { computePaymentSplitUsd, round2 } from "./service-order-form.payment";
import { caixaTemTodosCamposPreenchidos, isCaixaPersonalizada, isFitaAdesiva } from "./service-order-form.verifications";
import { serviceOrderFormCrud } from "./service-order-form.crud";
import { resolveSignatureToMinioUrl } from "./service-order-form.signature";

/** PATCH/POST podem não devolver produtos com `containerBoxNumber`; o GET por id sim (recibo, etiquetas). */
async function ordemCompletaParaCallback<T extends { id?: string | null }>(fallback: T): Promise<T> {
  const id = typeof fallback.id === "string" ? fallback.id.trim() : "";
  if (!id) return fallback;
  const res = await serviceOrderFormService.getById(id);
  return (res.success && res.data ? (res.data as unknown as T) : fallback);
}

type Params = {
  isEditMode: boolean;
  appointmentId: string;
  agendamento: { containerId?: string | null } | null | undefined;
  containerId: string;
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
  ordemStatus: DriverServiceOrder["status"];
  ordemObservacoes: string;
  paymentPoolUsd: number;
  totalReceivedUsd: number;
  cashUsd: number;
  assinaturaCliente: string;
  assinaturaAgente: string;
  canvasClienteRef: React.RefObject<HTMLCanvasElement | null>;
  canvasAgenteRef: React.RefObject<HTMLCanvasElement | null>;
  clienteAssinaturaDirtyRef: React.MutableRefObject<boolean>;
  agenteAssinaturaDirtyRef: React.MutableRefObject<boolean>;
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
  opcoesCaixa: ProductPrice[];
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
        ...computePaymentSplitUsd({
          paymentPoolUsd: params.paymentPoolUsd,
          totalReceivedUsd: params.totalReceivedUsd,
          cashUsd: params.cashUsd,
        }),
      },
      motoristaResponsavel: params.motoristaResponsavel,
      containerId: String(params.containerId ?? "").trim(),
      assinaturas: {
        clientSignature: params.assinaturaCliente.trim(),
        agentSignature: params.assinaturaAgente.trim(),
      },
      caixas: params.caixas.map((c) => ({ id: c.id, productId: c.productId, type: c.type, value: c.value, weight: c.weight })),
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
    const ordem = params.existingOrdem as { driverId?: string; userId?: string; driverName?: string };
    let expectedMotoristaId = ordem.driverId || ordem.userId || "";
    if (params.motoristas.length && ordem.driverName) {
      const matchByName = params.motoristas.find((m) => m.name === ordem.driverName);
      if (matchByName) expectedMotoristaId = matchByName.id;
    }
    if (params.motoristaResponsavel !== expectedMotoristaId) return;
    const expectedContainerId = String(
      params.existingOrdem?.container?.id ??
        (params.existingOrdem as { containerId?: string }).containerId ??
        "",
    ).trim();
    if (String(params.containerId ?? "").trim() !== expectedContainerId) return;
    setInitialSnapshot(editSnapshot);
  }, [params, initialSnapshot, editSnapshot]);

  const salvarOrdemServico = async () => {
    if (params.isEditMode && !canSave) return toast.info("Nenhum campo alterado.");
    if (!params.remetenteNome || !params.remetenteTel || !params.remetenteEndereco || !params.remetenteNumero || !params.remetenteCidade || !params.remetenteEstado || !params.remetenteZipCode) {
      return toast.error("Preencha todos os campos obrigatórios do remetente");
    }
    if (!params.destinatarioNome || !params.destinatarioEndereco || !params.destinatarioBairro || !params.destinatarioCidade || !params.destinatarioEstado || !params.destinatarioCep || !params.destinatarioTelefone || !params.destinatarioNumero) {
      return toast.error("Preencha todos os campos obrigatórios do destinatário");
    }
    const agendamentoTemContainer = Boolean(String(params.agendamento?.containerId ?? "").trim());

    const containerIdGestao =
      String(params.containerId ?? "").trim() || String(params.agendamento?.containerId ?? "").trim();
    /** Com container no agendamento, o back-office precisa manter o vínculo (estado hidratado do agendamento). */
    if (params.user?.role !== "motorista" && agendamentoTemContainer && !containerIdGestao) {
      return toast.error("Selecione o container da ordem de serviço.");
    }

    if (params.caixas.length === 0) return toast.error("Adicione pelo menos um volume ou produto");
    if (params.caixas.some((c) => !caixaTemTodosCamposPreenchidos(c))) return toast.error("Preencha todos os campos dos volumes ou produtos antes de salvar");
    const caixaSemItensObrigatorios = params.caixas.some((c) => {
      if (isFitaAdesiva(c, params.opcoesCaixa) || isCaixaPersonalizada(c, params.opcoesCaixa)) return false;
      return params.itens.filter((i) => i.caixaId === c.id).length === 0;
    });
    if (caixaSemItensObrigatorios) return toast.error("Cada volume precisa ter ao menos 1 item (fita adesiva e item personalizado não exigem itens)");
    const itemInvalido = params.itens.some((i) => !String(i.name ?? "").trim() || Number(i.quantity) <= 0 || Number(i.weight) <= 0);
    if (itemInvalido) return toast.error("Preencha todos os campos dos itens antes de salvar");

    /** Só o estado local (hidratado na edição com as URLs guardadas). Sem fallback para a ordem: se o utilizador limpar, fica vazio e deve voltar a assinar. */
    let assinaturaClienteFinal = String(params.assinaturaCliente ?? "").trim();
    let assinaturaAgenteFinal = String(params.assinaturaAgente ?? "").trim();
    if (!assinaturaClienteFinal) return toast.error("É necessária a assinatura do cliente");
    if (!assinaturaAgenteFinal) return toast.error("É necessária a assinatura do agente");

    const criandoComoMotorista = !params.isEditMode && params.user?.role === "motorista";
    let idMotoristaResponsavel = "";
    if (criandoComoMotorista) {
      idMotoristaResponsavel = String(params.user?.id ?? "").trim();
      if (!idMotoristaResponsavel) return toast.error("Sessão inválida. Faça login novamente.");
    } else {
      if (params.motoristasLoading) return toast.error("Aguarde o carregamento da lista de motoristas.");
      if (!params.motoristas.length) return toast.error("Não há motoristas disponíveis. Tente novamente em instantes.");
      idMotoristaResponsavel = String(params.motoristaResponsavel ?? "").trim();
      if (!idMotoristaResponsavel) return toast.error("Selecione um motorista responsável");
      const motoristaNaLista = params.motoristas.some((m) => m.id === idMotoristaResponsavel);
      const motoristaEhUsuarioLogado = params.isEditMode && params.user?.role === "motorista" && idMotoristaResponsavel === params.user?.id;
      if (!motoristaNaLista && !motoristaEhUsuarioLogado) return toast.error("Selecione um motorista válido na lista.");
    }

    const uploadPair = async (orderId: string) => {
      const [cu, au] = await Promise.all([
        resolveSignatureToMinioUrl({
          raw: assinaturaClienteFinal,
          canvasRef: params.canvasClienteRef,
          dirtyRef: params.clienteAssinaturaDirtyRef,
          serviceOrderId: orderId,
          role: "client",
        }),
        resolveSignatureToMinioUrl({
          raw: assinaturaAgenteFinal,
          canvasRef: params.canvasAgenteRef,
          dirtyRef: params.agenteAssinaturaDirtyRef,
          serviceOrderId: orderId,
          role: "agent",
        }),
      ]);
      if (!cu || !au) return null;
      return { clientUrl: cu, agentUrl: au };
    };

    if (params.isEditMode && params.existingOrdem?.id) {
      const urls = await uploadPair(params.existingOrdem.id);
      if (!urls) {
        return toast.error("Não foi possível enviar as assinaturas ao armazenamento. Tente novamente.");
      }
      assinaturaClienteFinal = urls.clientUrl;
      assinaturaAgenteFinal = urls.agentUrl;
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
      driverId: idMotoristaResponsavel,
      status: criandoComoMotorista ? "COMPLETED" : params.ordemStatus,
      paymentPoolUsd: params.paymentPoolUsd,
      totalReceivedUsd: params.totalReceivedUsd,
      cashUsd: params.cashUsd,
      observations: !params.isEditMode
        ? params.observations?.trim() || undefined
        : params.ordemObservacoes.trim() || undefined,
      omitSignatures: !params.isEditMode,
      containerId:
        params.user?.role === "motorista" ? undefined : containerIdGestao || undefined,
    });

    if (!params.isEditMode || !params.existingOrdem?.id) {
      const created = await serviceOrderFormCrud.create(payload);
      if (created.success && created.data) {
        const newId = created.data.id;
        if (!newId) {
          toast.error("Ordem criada sem identificador. Tente novamente.");
          return;
        }
        const urls = await uploadPair(newId);
        if (!urls) {
          toast.error("Ordem criada, mas falhou o envio das assinaturas. Abra a ordem e salve novamente.");
          params.onClose();
          void Promise.resolve(params.onAgendamentosAtualizados?.()).catch(() => {});
          params.onSave?.(await ordemCompletaParaCallback(created.data));
          return;
        }
        const patched = await serviceOrderFormCrud.update(newId, {
          clientSignature: urls.clientUrl,
          agentSignature: urls.agentUrl,
          signatureDate: new Date().toISOString(),
        });
        if (!patched.success || !patched.data) {
          toast.error(patched.error ?? "Não foi possível registrar as URLs das assinaturas.");
          return;
        }
        params.onClose();
        void Promise.resolve(params.onAgendamentosAtualizados?.()).catch(() => {});
        params.onSave?.(await ordemCompletaParaCallback(patched.data));
        toast.success("Ordem de serviço salva com sucesso!");
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

    const patch: Partial<DriverServiceOrder> = {};
    const remetenteChanged = JSON.stringify(currentObj?.remetente) !== JSON.stringify(initialObj?.remetente);
    const destinatarioChanged = JSON.stringify(currentObj?.destinatario) !== JSON.stringify(initialObj?.destinatario);
    const statusChanged = currentObj?.ordem?.status !== initialObj?.ordem?.status;
    const observationsChanged = currentObj?.ordem?.observations !== initialObj?.ordem?.observations;
    const paymentSplitChanged =
      round2(Number(currentObj?.ordem?.cashReceivedUsd ?? 0)) !== round2(Number(initialObj?.ordem?.cashReceivedUsd ?? 0)) ||
      round2(Number(currentObj?.ordem?.zelleReceivedUsd ?? 0)) !== round2(Number(initialObj?.ordem?.zelleReceivedUsd ?? 0));
    const clientSignatureChanged = currentObj?.assinaturas?.clientSignature !== initialObj?.assinaturas?.clientSignature;
    const agentSignatureChanged = currentObj?.assinaturas?.agentSignature !== initialObj?.assinaturas?.agentSignature;
    const motoristaChanged = String(currentObj?.motoristaResponsavel ?? "").trim() !== String(initialObj?.motoristaResponsavel ?? "").trim();
    const containerChanged =
      String(currentObj?.containerId ?? "").trim() !== String(initialObj?.containerId ?? "").trim();
    const caixasChanged = JSON.stringify(currentObj?.caixas) !== JSON.stringify(initialObj?.caixas);
    const itensChanged = JSON.stringify(currentObj?.itens) !== JSON.stringify(initialObj?.itens);

    if (remetenteChanged) patch.sender = payload.sender;
    if (destinatarioChanged) patch.recipient = payload.recipient;
    if (statusChanged) patch.status = payload.status;
    if (observationsChanged) patch.observations = currentObj?.ordem?.observations ?? "";
    if (paymentSplitChanged) {
      patch.cashReceivedUsd = payload.cashReceivedUsd;
      patch.zelleReceivedUsd = payload.zelleReceivedUsd;
    }
    if (motoristaChanged) {
      patch.driverId = payload.driverId;
    }
    if (containerChanged && params.user?.role === "admin") {
      const cur = String(currentObj?.containerId ?? "").trim();
      (patch as { containerId?: string | null }).containerId = cur === "" ? null : cur;
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
        const caixaDiff =
          String(cur.productId ?? "") !== String(init.productId ?? "") ||
          cur.type !== init.type ||
          cur.value !== init.value ||
          cur.weight !== init.weight;
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
        const caixasAlteradas = params.caixas.filter((c) => changedCaixaIds.has(String(c.id)));
        patch.driverServiceOrderProducts = buildDriverServiceOrderProducts({
          caixas: caixasAlteradas,
          itens: params.itens,
          opcoesCaixa: params.opcoesCaixa,
          existingProductIds: params.existingProductIds,
        });
      }
    }

    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) delete (patch as any)[k];
    }
    if (Object.keys(patch).length === 0) return toast.info("Nenhum campo alterado.");

    const result = await serviceOrderFormCrud.update(params.existingOrdem.id, patch);
    if (result.success && result.data) {
      params.onSave?.(await ordemCompletaParaCallback(result.data));
      void Promise.resolve(params.onAgendamentosAtualizados?.()).catch(() => { });
      toast.success("Ordem de serviço atualizada com sucesso!");
      params.onClose();
      return;
    }
    toast.error(result.error || "Erro ao atualizar ordem de serviço");
  };

  return { canSave, salvarOrdemServico };
}

