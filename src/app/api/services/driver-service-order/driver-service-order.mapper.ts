import type { OrdemServicoMotorista } from "../../types";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

/** Ordem no formato do app + metadados opcionais vindos do GET (appointment / company). */
export type OrdemServicoView = OrdemServicoMotorista & {
  createdAt?: string;
  updatedAt?: string;
  appointment?: {
    id: string;
    collectionDate?: string;
    collectionTime?: string;
    isPeriodic?: boolean;
  };
  company?: {
    id?: string;
    name?: string;
    contactPhone?: string;
    address?: string;
  };
};

function normalizeSender(s: unknown): OrdemServicoMotorista["sender"] {
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

function normalizeRecipient(r: unknown): OrdemServicoMotorista["recipient"] {
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

function normalizeStatus(s: unknown): OrdemServicoMotorista["status"] {
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

function mapProducts(raw: unknown): OrdemServicoMotorista["driverServiceOrderProducts"] {
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
    return {
      id: String(row.id ?? ""),
      number: String(row.number ?? ""),
      productId: row.productId != null ? String(row.productId) : undefined,
      type: String(row.type ?? ""),
      weight: Number(row.weight) || 0,
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
export function mapDriverServiceOrderApiToView(raw: unknown): OrdemServicoView | null {
  const r = asRecord(raw);
  if (!r) return null;

  const id = String(r.id ?? "");
  const aptNested = asRecord(r.appointment);
  const appointmentId = String(r.appointmentId ?? aptNested?.id ?? "");
  if (!id || !appointmentId) return null;

  const driver = asRecord(r.driver);

  const ordem: OrdemServicoView = {
    id,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
    appointmentId,
    sender: normalizeSender(r.sender),
    recipient: normalizeRecipient(r.recipient),
    driverServiceOrderProducts: mapProducts(pickProductsArray(r)),
    clientSignature: String(r.clientSignature ?? ""),
    agentSignature: String(r.agentSignature ?? ""),
    signatureDate: toIso(r.signatureDate),
    driverName: String(r.driverName ?? driver?.name ?? ""),
    userId: String(r.userId ?? driver?.id ?? ""),
    status: normalizeStatus(r.status),
    chargedValue: Number(r.chargedValue) || 0,
    observations: r.observations != null ? String(r.observations) : undefined,
  };

  if (aptNested) {
    ordem.appointment = {
      id: String(aptNested.id ?? appointmentId),
      collectionDate:
        aptNested.collectionDate != null ? String(aptNested.collectionDate) : undefined,
      collectionTime:
        aptNested.collectionTime != null ? String(aptNested.collectionTime) : undefined,
      isPeriodic: Boolean(aptNested.isPeriodic),
    };
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
