import type { Caixa, Item, DriverServiceOrder, ProductPrice } from "../../../api";
import { round2 } from "./service-order-form.payment";

type BuildProductsParams = {
  caixas: Caixa[];
  itens: Item[];
  opcoesCaixa: ProductPrice[];
  existingProductIds: Set<string>;
};

/** Monta linhas de produto da OS (criação e PATCH parcial) — uma única fonte de verdade. */
export function buildDriverServiceOrderProducts({
  caixas,
  itens,
  opcoesCaixa,
  existingProductIds,
}: BuildProductsParams) {
  return caixas.map((c) => ({
    ...(existingProductIds.has(c.id) ? { id: c.id } : {}),
    ...(c.productId
      ? { productId: c.productId }
      : (() => {
          const produto = opcoesCaixa.find(
            (p) => p.size === c.type || p.name === c.type || (p.dimensions != null && p.dimensions === c.type),
          );
          return produto?.id ? { productId: produto.id } : {};
        })()),
    value: c.value,
    weight: c.weight,
    driverServiceOrderProductsItems: itens
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

type BuildPayloadParams = {
  appointmentId: string;
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
  destinatarioComplemento: string;
  destinatarioNumero: string;
  destinatarioTelefone: string;
  caixas: Caixa[];
  itens: Item[];
  opcoesCaixa: ProductPrice[];
  existingProductIds: Set<string>;
  assinaturaClienteFinal: string;
  assinaturaAgenteFinal: string;
  /** Criação em duas etapas: OS sem assinaturas para obter o id e depois `PATCH` com URLs do MinIO. */
  omitSignatures?: boolean;
  /** CUID do motorista; na criação, gestão envia o escolhido; motorista logado pode omitir (API usa o token). */
  driverId: string;
  status: DriverServiceOrder["status"];
  /** Subtotal agendamento + volumes — teto da repartição espécie/Zelle. */
  paymentPoolUsd: number;
  /** Parcela em espécie (USD); Zelle = pool − espécie. */
  cashUsd: number;
  observations: string | undefined;
  /** Backoffice: incluído quando há vínculo; omitido se não houver container. Motorista não envia (API usa o agendamento). */
  containerId?: string;
};

export function buildServiceOrderPayload(params: BuildPayloadParams): DriverServiceOrder {
  return {
    appointmentId: params.appointmentId,
    sender: {
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
    recipient: {
      brazilName: params.destinatarioNome,
      brazilCpf: params.destinatarioCpfRg,
      brazilAddress: {
        rua: params.destinatarioEndereco,
        bairro: params.destinatarioBairro,
        cidade: params.destinatarioCidade,
        estado: params.destinatarioEstado,
        cep: params.destinatarioCep,
        complemento: params.destinatarioComplemento,
        numero: params.destinatarioNumero,
      },
      brazilPhone: params.destinatarioTelefone,
    },
    driverServiceOrderProducts: buildDriverServiceOrderProducts({
      caixas: params.caixas,
      itens: params.itens,
      opcoesCaixa: params.opcoesCaixa,
      existingProductIds: params.existingProductIds,
    }),
    ...(params.omitSignatures
      ? {}
      : {
          clientSignature: params.assinaturaClienteFinal,
          agentSignature: params.assinaturaAgenteFinal,
        }),
    signatureDate: new Date().toISOString(),
    driverId: params.driverId,
    status: params.status,
    ...(() => {
      const pool = round2(Math.max(0, params.paymentPoolUsd));
      const cash = round2(Math.min(Math.max(params.cashUsd, 0), pool));
      const zelle = round2(pool - cash);
      return { cashReceivedUsd: cash, zelleReceivedUsd: zelle };
    })(),
    observations:
      params.observations !== undefined && params.observations !== null && String(params.observations).trim() !== ""
        ? String(params.observations).trim()
        : undefined,
    ...(params.containerId != null && String(params.containerId).trim() !== ""
      ? { containerId: String(params.containerId).trim() }
      : {}),
  };
}

