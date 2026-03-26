import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "../../stock";
import type { Caixa, Item, OrdemServicoMotorista, PrecoProduto } from "../../../api";
import { obterTipoProdutoDaCaixa } from "./service-order-form.verifications";

type BuildProductsParams = {
  caixas: Caixa[];
  itens: Item[];
  opcoesCaixa: PrecoProduto[];
  existingProductIds: Set<string>;
};

function buildDriverServiceOrderProducts({
  caixas,
  itens,
  opcoesCaixa,
  existingProductIds,
}: BuildProductsParams) {
  return caixas.map((c) => ({
    ...(existingProductIds.has(c.id) ? { id: c.id } : {}),
    type: `${c.type} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[obterTipoProdutoDaCaixa(c, opcoesCaixa) as keyof typeof PRODUCT_TYPE_TO_ITEM_KEY]]}`,
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
  opcoesCaixa: PrecoProduto[];
  existingProductIds: Set<string>;
  assinaturaClienteFinal: string;
  assinaturaAgenteFinal: string;
  driverName: string;
  userId: string;
  status: OrdemServicoMotorista["status"];
  valorPago: string;
  observations: string | undefined;
};

export function buildServiceOrderPayload(params: BuildPayloadParams): OrdemServicoMotorista {
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
    clientSignature: params.assinaturaClienteFinal,
    agentSignature: params.assinaturaAgenteFinal,
    signatureDate: new Date().toISOString(),
    driverName: params.driverName,
    userId: params.userId,
    status: params.status,
    chargedValue: parseFloat(params.valorPago),
    observations: params.observations,
  };
}

