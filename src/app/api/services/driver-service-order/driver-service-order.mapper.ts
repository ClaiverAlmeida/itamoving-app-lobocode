import type { DriverServiceOrder } from "../../interfaces/service-order";
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "../../../components/stock";
import type { ProductType } from "../../../components/stock/stock.types";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

/** Ordem no formato do app + metadados opcionais vindos do GET (appointment / company). */
export type DriverServiceOrderView = DriverServiceOrder & {
  container?: {
    id: string | null;
    number: string | null;
    type: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
  appointment?: {
    id: string;
    collectionDate?: string;
    collectionTime?: string;
    isPeriodic?: boolean;
    value?: number;
    downPayment?: number;
    client?: {
      id: string;
      usaName?: string;
      brazilName?: string;
    };
  };
  company?: {
    id?: string;
    name?: string;
    contactPhone?: string;
    address?: string;
  };
};

function normalizeSender(s: unknown): DriverServiceOrder["sender"] {
  const o = asRecord(s) ?? {};
  const addr = asRecord(o.usaAddress) ?? {};
  return {
    usaName: String(o.usaName ?? ""),
    usaPhone: String(o.usaPhone ?? ""),
    usaCpf: String(o.usaCpf ?? ""),
    usaAddress: {
      rua: String(addr.rua ?? ""),
      numero: String(addr.numero ?? ""),
      cidade: String(addr.cidade ?? ""),
      estado: String(addr.estado ?? ""),
      zipCode: String(addr.zipCode ?? ""),
      complemento: addr.complemento != null ? String(addr.complemento) : undefined,
    },
  };
}

function normalizeRecipient(r: unknown): DriverServiceOrder["recipient"] {
  const o = asRecord(r) ?? {};
  const addr = asRecord(o.brazilAddress) ?? {};
  return {
    brazilName: String(o.brazilName ?? ""),
    brazilCpf: String(o.brazilCpf ?? ""),
    brazilPhone: String(o.brazilPhone ?? ""),
    brazilAddress: {
      rua: String(addr.rua ?? ""),
      bairro: String(addr.bairro ?? ""),
      cidade: String(addr.cidade ?? ""),
      estado: String(addr.estado ?? ""),
      cep: String(addr.cep ?? ""),
      numero: addr.numero != null ? String(addr.numero) : undefined,
      complemento: addr.complemento != null ? String(addr.complemento) : undefined,
    },
  };
}

function normalizeContainer(c: unknown): DriverServiceOrder["container"] {
  const o = asRecord(c) ?? {};
  return {
    id: o.id != null ? String(o.id) : null,
    number: o.number != null ? String(o.number) : null,
    type: o.type != null ? String(o.type) : null,
  };
}

function normalizeStatus(s: unknown): DriverServiceOrder["status"] {
  const v = String(s ?? "PENDING");
  if (v === "IN_PROGRESS" || v === "COMPLETED" || v === "PENDING") return v;
  return "PENDING";
}

function pickProductsArray(r: Record<string, unknown>): unknown {
  const camel = r.driverServiceOrderProducts;
  if (Array.isArray(camel)) return camel;
  const snake = r.driver_service_order_products;
  if (Array.isArray(snake)) return snake;
  return [];
}

function pickItemsArray(row: Record<string, unknown>): unknown {
  const camel = row.driverServiceOrderProductsItems;
  if (Array.isArray(camel)) return camel;
  const snake = row.driver_service_order_products_items;
  if (Array.isArray(snake)) return snake;
  return [];
}

type OsLineProduct = NonNullable<
  DriverServiceOrder["driverServiceOrderProducts"][number]["product"]
>;

function mapProductRelation(raw: unknown): OsLineProduct | undefined {
  const row = asRecord(raw);
  if (row == null || row.id == null) return undefined;
  const t = String(row.type ?? "");
  return {
    id: String(row.id),
    type: t as OsLineProduct["type"],
    name: String(row.name ?? ""),
    dimensions: row.dimensions != null ? String(row.dimensions) : null,
  };
}

function mapDeliveryPriceRelation(raw: unknown):
  | NonNullable<DriverServiceOrder["driverServiceOrderProducts"][number]["deliveryPrice"]>
  | undefined {
  const row = asRecord(raw);
  if (row == null || row.id == null) return undefined;
  const prod = mapProductRelation(row.product);
  return {
    id: String(row.id),
    routeName: String(row.routeName ?? ""),
    totalPrice: row.totalPrice != null ? Number(row.totalPrice) : undefined,
    productId: row.productId != null ? String(row.productId) : undefined,
    ...(prod ? { product: prod } : {}),
  };
}

function displayTypeFromProductRelation(productRaw: Record<string, unknown> | undefined): string {
  if (!productRaw) return "";
  const t = String(productRaw.type ?? "") as ProductType;
  const itemKey = PRODUCT_TYPE_TO_ITEM_KEY[t];
  const label = itemKey ? ITEM_LABELS[itemKey] : "";
  const name = String(productRaw.name ?? "");
  return label ? `${name} - ${label}` : name;
}

function mapProducts(raw: unknown): DriverServiceOrder["driverServiceOrderProducts"] {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((p) => {
    const row = asRecord(p) ?? {};
    const itemsRaw = pickItemsArray(row);
    const items = Array.isArray(itemsRaw)
      ? itemsRaw.map((it) => {
        const i = asRecord(it) ?? {};
        return {
          id: String(i.id ?? ''),
          driverServiceOrderId:
            i.driverServiceOrderId != null ? String(i.driverServiceOrderId) : undefined,
          name: String(i.name ?? ""),
          quantity: Number(i.quantity) || 0,
          weight: Number(i.weight) || 0,
          observations: i.observations != null ? String(i.observations) : undefined,
        };
      })
      : [];
    const product = mapProductRelation(row.product);
    const productRaw = asRecord(row.product) ?? {};
    const typeFromRelation = displayTypeFromProductRelation(productRaw);
    const legacyType = String(row.type ?? "");
    const deliveryPriceIdRaw =
      row.deliveryPriceId ?? (row as Record<string, unknown>).delivery_price_id;
    const deliveryPriceId =
      deliveryPriceIdRaw != null && String(deliveryPriceIdRaw).trim() !== ""
        ? String(deliveryPriceIdRaw)
        : undefined;
    const deliveryPrice = mapDeliveryPriceRelation(
      row.deliveryPrice ?? (row as Record<string, unknown>).delivery_price,
    );
    const cp = asRecord(row.containerProduct ?? (row as Record<string, unknown>).container_product);
    const containerBoxNumber =
      cp != null && cp.boxNumber != null && String(cp.boxNumber).trim() !== ""
        ? String(cp.boxNumber).trim()
        : undefined;
    const tipoFrete =
      deliveryPriceId && deliveryPrice
        ? `Frete: ${deliveryPrice.routeName}`
        : deliveryPriceId
          ? "Frete"
          : "";
    const rawLineWeight = row.weight;
    const weightLinha = deliveryPriceId
      ? rawLineWeight != null &&
          rawLineWeight !== "" &&
          Number.isFinite(Number(rawLineWeight))
        ? Number(rawLineWeight)
        : undefined
      : Number(rawLineWeight) || 0;
    return {
      id: String(row.id ?? ""),
      number: String(row.number ?? ""),
      containerBoxNumber,
      productId: row.productId != null ? String(row.productId) : undefined,
      deliveryPriceId,
      deliveryPrice,
      type: tipoFrete || typeFromRelation || legacyType,
      productType: product?.type,
      product,
      ...(deliveryPriceId && weightLinha === undefined ? {} : { weight: weightLinha as number }),
      value: Number(row.value) || 0,
      driverServiceOrderProductsItems: items,
    };
  });
}

function toIso(d: unknown): string {
  if (d == null) return new Date().toISOString();
  if (typeof d === "string") return d;
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

/**
 * Converte um registro retornado pelo GET `/driver-service-order` (Prisma + universal)
 * para o modelo usado pelo app (formulário, recibo, tabela).
 */
export function mapDriverServiceOrderApiToView(raw: unknown): DriverServiceOrderView | null {
  const r = asRecord(raw);
  if (!r) return null;

  const id = String(r.id ?? "");
  const aptNested = asRecord(r.appointment);
  const appointmentId = String(r.appointmentId ?? aptNested?.id ?? "");
  if (!id || !appointmentId) return null;

  const driver = asRecord(r.driver);

  const containerNorm = normalizeContainer(r.container);
  const ordem: DriverServiceOrderView = {
    id,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
    appointmentId,
    sender: normalizeSender(r.sender),
    container: containerNorm,
    containerId:
      r.containerId != null && String(r.containerId).trim() !== ""
        ? String(r.containerId)
        : containerNorm?.id ?? undefined,
    recipient: normalizeRecipient(r.recipient),
    driverServiceOrderProducts: mapProducts(pickProductsArray(r)),
    clientSignature: String(r.clientSignature ?? ""),
    agentSignature: String(r.agentSignature ?? ""),
    signatureDate: toIso(r.signatureDate),
    driverName: String(driver?.name ?? r.driverName ?? ""),
    driverId: String(driver?.id ?? r.driverId ?? ""),
    status: normalizeStatus(r.status),
    ...(() => {
      let cash = Number(r.cashReceivedUsd ?? r.cash_received_usd) || 0;
      let zelle = Number(r.zelleReceivedUsd ?? r.zelle_received_usd) || 0;
      if (cash === 0 && zelle === 0 && r.chargedValue != null) {
        cash = Number(r.chargedValue) || 0;
      }
      return { cashReceivedUsd: cash, zelleReceivedUsd: zelle };
    })(),
    observations: r.observations != null ? String(r.observations) : undefined,
  };

  if (aptNested) {
    const aptClient = asRecord(aptNested.client);
    ordem.appointment = {
      id: String(aptNested.id ?? appointmentId),
      collectionDate:
        aptNested.collectionDate != null ? String(aptNested.collectionDate) : undefined,
      collectionTime:
        aptNested.collectionTime != null ? String(aptNested.collectionTime) : undefined,
      isPeriodic: Boolean(aptNested.isPeriodic),
      value: aptNested.value != null ? Number(aptNested.value) : undefined,
      downPayment:
        aptNested.downPayment != null ? Number(aptNested.downPayment) : undefined,
    };
    if (aptClient?.id != null) {
      ordem.appointment.client = {
        id: String(aptClient.id),
        usaName: aptClient.usaName != null ? String(aptClient.usaName) : undefined,
        brazilName: aptClient.brazilName != null ? String(aptClient.brazilName) : undefined,
      };
    }
  }

  const comp = asRecord(r.company);
  if (comp) {
    ordem.company = {
      id: comp.id != null ? String(comp.id) : undefined,
      name: comp.name != null ? String(comp.name) : undefined,
      contactPhone: comp.contactPhone != null ? String(comp.contactPhone) : undefined,
      address: comp.address != null ? String(comp.address) : undefined,
    };
  }

  return ordem;
}

/** Extrai o array de registros do corpo paginado ou de um array direto. */
export function extractDriverServiceOrderList(body: unknown): unknown[] {
  if (body == null) return [];
  if (Array.isArray(body)) return body;
  const b = asRecord(body);
  if (b && Array.isArray(b.data)) return b.data;
  return [];
}
