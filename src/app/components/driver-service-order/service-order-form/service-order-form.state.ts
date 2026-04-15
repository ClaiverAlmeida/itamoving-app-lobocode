import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Caixa, Container, DeliveryPrice, DriverUser, Item, ProductPrice } from "../../../api";
import { serviceOrderFormCrud } from "./service-order-form.crud";
import { loadDataUrlOnCanvas, resolveCaixaSelectValueFromApiLine } from "./service-order-form.utils";
import { caixaTemTodosCamposPreenchidos, novoIdItem, renumerarCaixas } from "./service-order-form.verifications";
import { computePaymentPoolUsd, computePaymentSplitUsd, round2 } from "./service-order-form.payment";

type Params = {
  appointmentId: string;
  agendamento: any;
  existingOrdem: any;
  user: { id?: string; role?: string } | null;
};

function getInitialClienteFieldsFromAgendamento(agendamento: any) {
  const c = agendamento?.client;
  const usa = c?.usaAddress ?? {};
  const br = c?.brazilAddress ?? {};
  return {
    remetenteNome: c?.usaName ?? "",
    remetenteTel: c?.usaPhone ?? "",
    remetenteEndereco: usa.rua ?? "",
    remetenteCidade: usa.cidade ?? "",
    remetenteEstado: usa.estado ?? "",
    remetenteZipCode: usa.zipCode ?? "",
    remetenteNumero: usa.numero ?? "",
    remetenteComplemento: usa.complemento ?? "",
    remetenteCpfRg: c?.usaCpf ?? "",
    destinatarioNome: c?.brazilName ?? "",
    destinatarioCpfRg: c?.brazilCpf ?? "",
    destinatarioEndereco: br.rua ?? "",
    destinatarioBairro: br.bairro ?? "",
    destinatarioCidade: br.cidade ?? "",
    destinatarioEstado: br.estado ?? "",
    destinatarioCep: br.cep ?? "",
    destinatarioTelefone: c?.brazilPhone ?? "",
    destinatarioNumero: br.numero ?? "",
    destinatarioComplemento: br.complemento ?? "",
  };
}

export function useServiceOrderFormState({
  appointmentId,
  agendamento,
  existingOrdem,
  user,
}: Params) {
  const isEditMode = Boolean(existingOrdem?.id);
  const canvasClienteRef = useRef<HTMLCanvasElement>(null);
  const canvasAgenteRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingCliente, setIsDrawingCliente] = useState(false);
  const [isDrawingAgente, setIsDrawingAgente] = useState(false);
  const [precosProdutos, setPrecosProdutos] = useState<ProductPrice[]>([]);
  const [precosEntrega, setPrecosEntrega] = useState<DeliveryPrice[]>([]);
  const [motoristas, setMotoristas] = useState<DriverUser[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [produtosLoading, setProdutosLoading] = useState(false);
  const [motoristasLoading, setMotoristasLoading] = useState(false);
  const [containersLoading, setContainersLoading] = useState(false);
  const [hydrationReady, setHydrationReady] = useState(false);
  const existingProductIdsRef = useRef<Set<string>>(new Set());

  const opcoesCaixa = useMemo(() => {
    const porTipo = precosProdutos.filter(
      (p) =>
        p.type === "SMALL_BOX" ||
        p.type === "MEDIUM_BOX" ||
        p.type === "LARGE_BOX" ||
        p.type === "PERSONALIZED_ITEM" ||
        p.type === "TAPE_ADHESIVE",
    );
    if (isEditMode) return porTipo;
    return porTipo.filter((p) => p.active);
  }, [precosProdutos, isEditMode]);

  const [initCliente] = useState(() => getInitialClienteFieldsFromAgendamento(agendamento));
  const [remetenteNome, setRemetenteNome] = useState(initCliente.remetenteNome);
  const [remetenteTel, setRemetenteTel] = useState(initCliente.remetenteTel);
  const [remetenteEndereco, setRemetenteEndereco] = useState(initCliente.remetenteEndereco);
  const [remetenteCidade, setRemetenteCidade] = useState(initCliente.remetenteCidade);
  const [remetenteEstado, setRemetenteEstado] = useState(initCliente.remetenteEstado);
  const [remetenteZipCode, setRemetenteZipCode] = useState(initCliente.remetenteZipCode);
  const [remetenteNumero, setRemetenteNumero] = useState(initCliente.remetenteNumero);
  const [remetenteComplemento, setRemetenteComplemento] = useState(initCliente.remetenteComplemento);
  const [remetenteCpfRg, setRemetenteCpfRg] = useState(initCliente.remetenteCpfRg);

  const [destinatarioNome, setDestinatarioNome] = useState(initCliente.destinatarioNome);
  const [destinatarioCpfRg, setDestinatarioCpfRg] = useState(initCliente.destinatarioCpfRg);
  const [destinatarioEndereco, setDestinatarioEndereco] = useState(initCliente.destinatarioEndereco);
  const [destinatarioBairro, setDestinatarioBairro] = useState(initCliente.destinatarioBairro);
  const [destinatarioCidade, setDestinatarioCidade] = useState(initCliente.destinatarioCidade);
  const [destinatarioEstado, setDestinatarioEstado] = useState(initCliente.destinatarioEstado);
  const [destinatarioCep, setDestinatarioCep] = useState(initCliente.destinatarioCep);
  const [destinatarioTelefone, setDestinatarioTelefone] = useState(initCliente.destinatarioTelefone);
  const [destinatarioNumero, setDestinatarioNumero] = useState(initCliente.destinatarioNumero);
  const [destinatarioComplemento, setDestinatarioComplemento] = useState(initCliente.destinatarioComplemento);

  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const resumoValoresProdutos = useMemo(() => {
    let volumeCount = 0;
    let valorVolumes = 0;
    let valorFrete = 0;
    for (const c of caixas) {
      if (c.lineKind === "delivery") valorFrete += Number(c.value) || 0;
      else {
        volumeCount += 1;
        valorVolumes += Number(c.value) || 0;
      }
    }
    return {
      volumeCount,
      valorVolumes,
      valorFrete,
      valorTotal: valorVolumes + valorFrete,
      temFrete: valorFrete > 0.005,
    };
  }, [caixas]);
  const [itens, setItens] = useState<Item[]>([]);
  const [assinaturaCliente, setAssinaturaCliente] = useState("");
  const [assinaturaAgente, setAssinaturaAgente] = useState("");
  const clienteAssinaturaDirtyRef = useRef(false);
  const agenteAssinaturaDirtyRef = useRef(false);
  /** Total registrado espécie + Zelle (≤ pool); na criação, preenche com o pool quando este fica disponível. */
  const [totalReceivedUsd, setTotalReceivedUsd] = useState(0);
  /** Parcela em espécie dentro do total registrado. */
  const [cashUsd, setCashUsd] = useState(0);
  const [observations, setObservations] = useState("");
  const [ordemStatus, setOrdemStatus] = useState<any>("COMPLETED");
  const [ordemObservacoes, setOrdemObservacoes] = useState("");
  const [motoristaResponsavel, setMotoristaResponsavel] = useState("");
  const [containerId, setContainerId] = useState(() => {
    const fromOrdem = existingOrdem?.container?.id ?? (existingOrdem as { containerId?: string })?.containerId;
    const initial = String(fromOrdem ?? agendamento?.containerId ?? "").trim();
    return initial;
  });
  const motoristaResponsavelNome = motoristas.find((m) => m.id === motoristaResponsavel)?.name;

  /** Com ID no agendamento não precisamos de GET /containers — o payload usa este CUID. */
  const containerIdDoAgendamento = useMemo(
    () => String(agendamento?.containerId ?? "").trim(),
    [agendamento?.containerId],
  );

  /**
   * Com container no agendamento: exibe rótulo fixo em vez do select (evita lista GET /containers).
   * Administrador pode alterar o vínculo da OS — não força leitura só pelo agendamento.
   */
  const containerDoAgendamentoSomenteLeitura = useMemo((): { id: string; label: string } | null => {
    if (user?.role === "admin") return null;
    if (!containerIdDoAgendamento) return null;
    const c = agendamento?.container;
    if (c?.number != null && String(c.number).trim() !== "") {
      const num = String(c.number).trim();
      const typ = c.type != null && String(c.type).trim() !== "" ? String(c.type).trim() : "";
      return { id: containerIdDoAgendamento, label: typ ? `${num} (${typ})` : num };
    }
    return { id: containerIdDoAgendamento, label: containerIdDoAgendamento };
  }, [containerIdDoAgendamento, agendamento?.container, user?.role]);

  const containersAtivos = useMemo(
    () => containers.filter((c) => c.status !== "CANCELLED"),
    [containers],
  );
  const valorTotalCaixas = resumoValoresProdutos.valorTotal;
  const paymentPoolUsd = useMemo(
    () =>
      computePaymentPoolUsd({
        valorAgendamento: Number(agendamento?.value ?? 0),
        valorAntecipacao: Number(agendamento?.downPayment ?? 0),
        valorTotalVolumes: valorTotalCaixas,
      }),
    [agendamento?.value, agendamento?.downPayment, valorTotalCaixas],
  );

  useEffect(() => {
    const pool = paymentPoolUsd;
    if (pool <= 0) {
      setTotalReceivedUsd(0);
      setCashUsd(0);
      return;
    }
    if (!existingOrdem?.id) {
      setTotalReceivedUsd((prev) => {
        if (prev === 0) return pool;
        return Math.min(prev, pool);
      });
    } else {
      setTotalReceivedUsd((t) => Math.min(Math.max(t, 0), pool));
    }
  }, [paymentPoolUsd, existingOrdem?.id]);

  useEffect(() => {
    setCashUsd((c) => Math.min(Math.max(c, 0), totalReceivedUsd));
  }, [totalReceivedUsd]);

  const carregarMotoristas = async () => {
    setMotoristasLoading(true);
    try {
      const result = await serviceOrderFormCrud.getDrivers();
      if (result.success && result.data) setMotoristas(result.data);
      else if (result.error) toast.error(result.error ?? "Não foi possível carregar os motoristas.");
    } finally {
      setMotoristasLoading(false);
    }
  };

  const carregarContainers = async () => {
    setContainersLoading(true);
    try {
      const result = await serviceOrderFormCrud.getContainers();
      if (result.success && result.data) setContainers(result.data);
      else if (result.error) toast.error(result.error ?? "Não foi possível carregar os containers.");
    } finally {
      setContainersLoading(false);
    }
  };

  const carregarProdutos = useCallback(async () => {
    setProdutosLoading(true);
    const result = await serviceOrderFormCrud.getProducts({
      includeDeletedForEdit: isEditMode,
      driverServiceOrderId: isEditMode ? existingOrdem?.id : undefined,
    });
    try {
      if (result.success && result.data) {
        setPrecosProdutos(result.data);
        return result.data;
      }
      return [] as ProductPrice[];
    } finally {
      setProdutosLoading(false);
    }
  }, [isEditMode, existingOrdem?.id]);

  const carregarPrecosEntrega = useCallback(async () => {
    const result = await serviceOrderFormCrud.getDeliveryPrices(1, 200, {
      includeDeletedForEdit: isEditMode,
      driverServiceOrderId: isEditMode ? existingOrdem?.id : undefined,
    });
    if (result.success && result.data) {
      setPrecosEntrega(result.data);
      return result.data;
    }
    return [] as DeliveryPrice[];
  }, [isEditMode, existingOrdem?.id]);

  const adicionarCaixa = async () => {
    const produtos = await carregarProdutos();
    const opcoesAtivas = produtos.filter(
      (p) =>
        (p.type === "SMALL_BOX" ||
          p.type === "MEDIUM_BOX" ||
          p.type === "LARGE_BOX" ||
          p.type === "PERSONALIZED_ITEM" ||
          p.type === "TAPE_ADHESIVE") &&
        p.active,
    );
    if (opcoesAtivas.length === 0) {
      toast.info("Não há produtos ativos para adicionar volumes; cadastre um produto para continuar.");
      return;
    }
    setCaixas((prev) =>
      renumerarCaixas([
        ...prev,
        { id: Date.now().toString(), lineKind: "volume", type: "", number: "", value: 0, weight: 0 },
      ]),
    );
  };

  const atualizarCaixa = (id: string, campo: keyof Caixa, valor: string | number) => {
    setCaixas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const novaCaixa = { ...c, [campo]: valor };
        if (campo === "type") {
          if (c.lineKind === "delivery") {
            const entrega = precosEntrega.find((e) => e.id === valor);
            if (entrega) {
              novaCaixa.deliveryPriceId = entrega.id;
              delete (novaCaixa as { productId?: string }).productId;
              delete (novaCaixa as { weight?: number }).weight;
              novaCaixa.value = entrega.totalPrice;
            }
          } else {
            const produto = opcoesCaixa.find(
              (p) => p.size === valor || p.name === valor || (p.dimensions != null && p.dimensions === valor),
            );
            if (produto) {
              novaCaixa.productId = produto.id;
              novaCaixa.value = produto.salePrice;
              novaCaixa.weight = produto.maxWeight ?? 0;
            }
          }
        }
        return novaCaixa;
      }),
    );
  };

  const removerCaixa = (id: string) => {
    setItens((prev) => prev.filter((i) => i.caixaId !== id));
    setCaixas((prev) => renumerarCaixas(prev.filter((c) => c.id !== id)));
  };

  const adicionarPrecoEntrega = async () => {
    const lista = await carregarPrecosEntrega();
    const opcoesAtivas = lista.filter((e) => e.active);
    if (opcoesAtivas.length === 0) {
      toast.info("Não há preços de entrega ativos; cadastre um preço de entrega para continuar.");
      return;
    }
    setCaixas((prev) =>
      renumerarCaixas([
        ...prev,
        {
          id: Date.now().toString(),
          lineKind: "delivery",
          type: "",
          number: "",
          value: 0,
        },
      ]),
    );
  };

  const adicionarItens = (caixaId: string) => {
    const caixa = caixas.find((c) => c.id === caixaId);
    if (caixa?.lineKind === "delivery") {
      toast.error("Itens não se aplicam à linha de frete.");
      return;
    }
    if (!caixa || !caixaTemTodosCamposPreenchidos(caixa)) {
      toast.error("Preencha tipo, peso e valor do volume antes de adicionar itens");
      return;
    }
    setItens((prev) => [...prev, { id: novoIdItem(), caixaId, name: "", quantity: 0, weight: 0, observations: "" }]);
  };

  const atualizarItem = (id: string, campo: keyof Item, valor: string | number) => {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  };

  const removerItens = (id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  const startDrawingCliente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasClienteRef.current;
    if (!canvas) return;
    setIsDrawingCliente(true);
    clienteAssinaturaDirtyRef.current = false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawCliente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingCliente) return;
    const canvas = canvasClienteRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    clienteAssinaturaDirtyRef.current = true;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1E3A5F";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingCliente = () => {
    setIsDrawingCliente(false);
    const canvas = canvasClienteRef.current;
    if (canvas && clienteAssinaturaDirtyRef.current) setAssinaturaCliente(canvas.toDataURL("image/png"));
  };

  const limparAssinaturaCliente = () => {
    const canvas = canvasClienteRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setAssinaturaCliente("");
    clienteAssinaturaDirtyRef.current = false;
  };

  const startDrawingAgente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasAgenteRef.current;
    if (!canvas) return;
    setIsDrawingAgente(true);
    agenteAssinaturaDirtyRef.current = false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawAgente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingAgente) return;
    const canvas = canvasAgenteRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    agenteAssinaturaDirtyRef.current = true;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1E3A5F";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingAgente = () => {
    setIsDrawingAgente(false);
    const canvas = canvasAgenteRef.current;
    if (canvas && agenteAssinaturaDirtyRef.current) setAssinaturaAgente(canvas.toDataURL("image/png"));
  };

  const limparAssinaturaAgente = () => {
    const canvas = canvasAgenteRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setAssinaturaAgente("");
    agenteAssinaturaDirtyRef.current = false;
  };

  useEffect(() => {
    void carregarMotoristas();
  }, []);

  /** Lista de containers para back-office; motorista não tem GET /containers. Com container no agendamento, só admin precisa da lista para trocar o vínculo da OS. */
  useEffect(() => {
    if (user?.role === "motorista") return;
    if (containerIdDoAgendamento && user?.role !== "admin") return;
    void carregarContainers();
  }, [containerIdDoAgendamento, user?.role]);

  useEffect(() => {
    void carregarProdutos();
  }, [carregarProdutos]);

  useEffect(() => {
    void (async () => {
      await carregarPrecosEntrega();
    })();
  }, [carregarPrecosEntrega]);

  useEffect(() => {
    if (existingOrdem?.id) return;
    if (user?.role === "motorista" && user?.id) setMotoristaResponsavel(user.id);
  }, [appointmentId, existingOrdem?.id, user?.role, user?.id]);

  useEffect(() => {
    if (existingOrdem?.id) return;
    const fromApt = String(agendamento?.containerId ?? "").trim();
    if (fromApt) setContainerId(fromApt);
  }, [agendamento?.containerId, existingOrdem?.id]);

  const hydratedKeyRef = useRef<string>("");
  useEffect(() => {
    setHydrationReady(false);
  }, [existingOrdem?.id]);

  useEffect(() => {
    if (existingOrdem?.id) return;
    const clearCanvas = (c: HTMLCanvasElement | null) => c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    clearCanvas(canvasClienteRef.current);
    clearCanvas(canvasAgenteRef.current);
    setAssinaturaCliente("");
    setAssinaturaAgente("");
    setHydrationReady(false);
    existingProductIdsRef.current = new Set();
    clienteAssinaturaDirtyRef.current = false;
    agenteAssinaturaDirtyRef.current = false;
  }, [appointmentId, existingOrdem?.id]);

  useEffect(() => {
    if (!existingOrdem?.id) return;
    const nProdutos = existingOrdem.driverServiceOrderProducts?.length ?? 0;
    const key = `${existingOrdem.id}:${precosProdutos.length}:${precosEntrega.length}:${nProdutos}`;
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    const prods = precosProdutos.filter(
      (p) =>
        p.type === "SMALL_BOX" ||
        p.type === "MEDIUM_BOX" ||
        p.type === "LARGE_BOX" ||
        p.type === "PERSONALIZED_ITEM" ||
        p.type === "TAPE_ADHESIVE",
    );

    const senderUsa = existingOrdem.sender?.usaAddress ?? {};
    const recipientBr = existingOrdem.recipient?.brazilAddress ?? {};
    setRemetenteNome(existingOrdem.sender?.usaName || "");
    setRemetenteTel(existingOrdem.sender?.usaPhone || "");
    setRemetenteEndereco(senderUsa.rua || "");
    setRemetenteCidade(senderUsa.cidade || "");
    setRemetenteEstado(senderUsa.estado || "");
    setRemetenteZipCode(senderUsa.zipCode || "");
    setRemetenteNumero(senderUsa.numero || "");
    setRemetenteComplemento(senderUsa.complemento?.trim() || "-");
    setRemetenteCpfRg(existingOrdem.sender?.usaCpf || "");
    setDestinatarioNome(existingOrdem.recipient?.brazilName || "");
    setDestinatarioCpfRg(existingOrdem.recipient?.brazilCpf || "");
    setDestinatarioEndereco(recipientBr.rua || "");
    setDestinatarioBairro(recipientBr.bairro || "");
    setDestinatarioCidade(recipientBr.cidade || "");
    setDestinatarioEstado(recipientBr.estado || "");
    setDestinatarioCep(recipientBr.cep || "");
    setDestinatarioTelefone(existingOrdem.recipient?.brazilPhone || "");
    setDestinatarioNumero(recipientBr.numero || "");
    setDestinatarioComplemento(recipientBr.complemento?.trim() || "-");
    setOrdemStatus(existingOrdem.status);
    setOrdemObservacoes(existingOrdem.observations ?? "");
    setMotoristaResponsavel(existingOrdem.driverId || (existingOrdem as { userId?: string }).userId || "");
    setContainerId(
      String(
        existingOrdem.container?.id ??
        (existingOrdem as { containerId?: string }).containerId ??
        "",
      ).trim(),
    );

    existingProductIdsRef.current = new Set(
      (existingOrdem.driverServiceOrderProducts ?? [])
        .map((p: any) => p.id)
        .filter((id: any): id is string => typeof id === "string" && id.length > 0),
    );

    setCaixas(
      renumerarCaixas(
        existingOrdem.driverServiceOrderProducts.map((p: any) => {
          const dpId = p.deliveryPriceId != null ? String(p.deliveryPriceId).trim() : "";
          if (dpId) {
            return {
              id: p.id!,
              lineKind: "delivery" as const,
              deliveryPriceId: dpId,
              type: dpId,
              number: "",
              value: p.value,
            };
          }
          return {
            id: p.id!,
            lineKind: "volume" as const,
            productId: p.productId ?? undefined,
            type: resolveCaixaSelectValueFromApiLine(p, prods),
            number: "",
            value: p.value,
            weight: p.weight,
          };
        }),
      ),
    );

    const mappedItens: Item[] = [];
    for (const p of existingOrdem.driverServiceOrderProducts ?? []) {
      const dpId = p.deliveryPriceId != null ? String(p.deliveryPriceId).trim() : "";
      if (dpId) continue;
      for (const it of p.driverServiceOrderProductsItems ?? []) {
        mappedItens.push({
          id: it.id ?? novoIdItem(),
          caixaId: p.id!,
          name: it.name,
          quantity: it.quantity,
          weight: it.weight,
          observations: it.observations ?? "",
        });
      }
    }
    setItens(mappedItens);

    const sub = Math.max(Number(agendamento?.value ?? 0) - Number(agendamento?.downPayment ?? 0), 0);
    const vol =
      existingOrdem.driverServiceOrderProducts?.reduce((s: number, p: { value?: number }) => s + Number(p?.value ?? 0), 0) ?? 0;
    const pool = round2(sub + vol);
    let cash = Number(existingOrdem.cashReceivedUsd ?? 0);
    let zelle = Number(existingOrdem.zelleReceivedUsd ?? 0);
    const legacy = Number((existingOrdem as { chargedValue?: number }).chargedValue ?? 0);
    if (!Number.isFinite(cash)) cash = 0;
    if (!Number.isFinite(zelle)) zelle = 0;
    if (cash === 0 && zelle === 0 && legacy > 0) cash = legacy;
    const split = computePaymentSplitUsd({
      paymentPoolUsd: pool,
      totalReceivedUsd: cash + zelle,
      cashUsd: cash,
    });
    setTotalReceivedUsd(round2(split.cashReceivedUsd + split.zelleReceivedUsd));
    setCashUsd(split.cashReceivedUsd);
    const sigC = existingOrdem.clientSignature || "";
    const sigA = existingOrdem.agentSignature || "";
    setAssinaturaCliente(sigC);
    setAssinaturaAgente(sigA);

       requestAnimationFrame(() => {
      loadDataUrlOnCanvas(sigC, canvasClienteRef);
      loadDataUrlOnCanvas(sigA, canvasAgenteRef);
      setHydrationReady(precosProdutos.length > 0 || precosEntrega.length > 0);
    });
  }, [existingOrdem, precosProdutos, precosEntrega]);

  useEffect(() => {
    if (!existingOrdem?.id || !motoristas.length) return;
    if (motoristas.some((m) => m.id === motoristaResponsavel)) return;
    const matchByName = motoristas.find((m) => m.name === existingOrdem.driverName);
    if (matchByName) setMotoristaResponsavel(matchByName.id);
  }, [existingOrdem?.id, existingOrdem?.driverName, motoristas, motoristaResponsavel]);

  return {
    isEditMode,
    canvasClienteRef,
    canvasAgenteRef,
    motoristas,
    containersAtivos,
    containersLoading,
    containerDoAgendamentoSomenteLeitura,
    containerId,
    setContainerId,
    produtosLoading,
    motoristasLoading,
    hydrationReady,
    opcoesCaixa,
    precosEntrega,
    resumoValoresProdutos,
    remetenteNome,
    setRemetenteNome,
    remetenteTel,
    setRemetenteTel,
    remetenteEndereco,
    setRemetenteEndereco,
    remetenteCidade,
    setRemetenteCidade,
    remetenteEstado,
    setRemetenteEstado,
    remetenteZipCode,
    setRemetenteZipCode,
    remetenteNumero,
    setRemetenteNumero,
    remetenteComplemento,
    setRemetenteComplemento,
    remetenteCpfRg,
    setRemetenteCpfRg,
    destinatarioNome,
    setDestinatarioNome,
    destinatarioCpfRg,
    setDestinatarioCpfRg,
    destinatarioEndereco,
    setDestinatarioEndereco,
    destinatarioBairro,
    setDestinatarioBairro,
    destinatarioCidade,
    setDestinatarioCidade,
    destinatarioEstado,
    setDestinatarioEstado,
    destinatarioCep,
    setDestinatarioCep,
    destinatarioTelefone,
    setDestinatarioTelefone,
    destinatarioNumero,
    setDestinatarioNumero,
    destinatarioComplemento,
    setDestinatarioComplemento,
    caixas,
    itens,
    assinaturaCliente,
    assinaturaAgente,
    cashUsd,
    setCashUsd,
    totalReceivedUsd,
    setTotalReceivedUsd,
    paymentPoolUsd,
    observations,
    setObservations,
    ordemStatus,
    setOrdemStatus,
    ordemObservacoes,
    setOrdemObservacoes,
    motoristaResponsavel,
    setMotoristaResponsavel,
    motoristaResponsavelNome,
    valorTotalCaixas,
    adicionarCaixa,
    atualizarCaixa,
    removerCaixa,
    adicionarPrecoEntrega,
    adicionarItens,
    atualizarItem,
    removerItens,
    startDrawingCliente,
    drawCliente,
    stopDrawingCliente,
    limparAssinaturaCliente,
    startDrawingAgente,
    drawAgente,
    stopDrawingAgente,
    limparAssinaturaAgente,
    existingProductIdsRef,
    clienteAssinaturaDirtyRef,
    agenteAssinaturaDirtyRef,
  };
}

