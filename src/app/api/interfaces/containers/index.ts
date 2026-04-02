/** Uma caixa fisicamente neste container (`ContainerProduct` + linha da OS). */
export type ContainerBoxLine = {
  clientId: string;
  clientName: string;
  boxNumber: string;
  size: string;
  weight: number;
  driverServiceOrderProductId?: string;
  driverServiceOrderId?: string;
  /** `DriverServiceOrder.containerId` — onde a OS está vinculada (pode diferir do container da carga). */
  orderPrimaryContainerId?: string | null;
  /** Itens da caixa quando o GET do container incluir `driverServiceOrderProductsItems`. */
  items?: Array<{
    id?: string;
    name: string;
    quantity: number;
    weight: number;
    observations?: string;
  }>;
};

/** UI model for a shipping container (distinct from {@link ContainersBackend}). */
export interface Container {
  id?: string;
  number: string;
  type?: string;
  seal?: string;
  origin?: string;
  destination?: string;
  shipmentDate?: string;
  boardingDate?: string;
  estimatedArrival?: string;
  volume?: number;
  /** Peso do container vazio — tara (kg). */
  emptyWeight?: number | null;
  /** Peso do container cheio — bruto (kg); limite de peso da carga. */
  fullWeight?: number | null;
  trackingLink?: string;
  status: "PREPARATION" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  /** Letra do volume (ex.: A, B) — numeração 1-A, 2-A… (gravada após a primeira ordem com caixas). */
  volumeLetter?: string;
  /** Contador de ordens de serviço vinculadas (incrementado pela API a cada vínculo). */
  volumeCapacity?: number | null;
  /** Quantidade de ordens de serviço já vinculadas a este container. */
  linkedServiceOrderCount?: number;
  /** Ordens de serviço vinculadas ao container. */
  serviceOrders?: {
    id: string;
    status?: string;
    /** Nome do remetente (EUA) — da OS ou do cliente do agendamento. */
    senderName?: string | null;
    createdAt?: string;
    /** Atendente da OS (`attendantId`); na associação ao container vira o usuário logado; limpo ao desvincular. */
    attendant?: { id: string; name: string } | null;
  }[];
  boxes?: ContainerBoxLine[];
  totalWeight?: number;
}

export interface CreateContainersDTO {
  number: string;
  type: string;
  seal: string;
  origin: string;
  destination: string;
  boardingDate: string;
  estimatedArrival: string;
  volume: number;
  emptyWeight?: number | null;
  fullWeight: number;
  trackingLink: string;
  status: Container["status"];
}

export interface ContainersBackend {
  id: string;
  number: string;
  type?: string;
  seal?: string;
  origin?: string;
  destination?: string;
  shipmentDate?: string;
  boardingDate?: string;
  estimatedArrival?: string;
  volume?: number;
  emptyWeight?: number | null;
  fullWeight?: number | null;
  trackingLink?: string;
  status: string;
  totalWeight?: number;
  volumeLetter?: string | null;
  volumeCapacity?: number | null;
  products?: Array<{
    id: string;
    boxNumber: string;
    clientId?: string | null;
    client?: { id?: string; usaName?: string | null; brazilName?: string | null } | null;
    driverServiceOrderProducts?: Array<{
      id?: string;
      containerProductId?: string | null;
      driverServiceOrderId?: string;
      weight?: number | null;
      product?: { type?: string; name?: string; dimensions?: string | null } | null;
      driverServiceOrder?: {
        id?: string;
        containerId?: string | null;
        sender?: unknown;
        appointment?: {
          client?: { usaName?: string | null; brazilName?: string | null } | null;
        } | null;
      } | null;
      driverServiceOrderProductsItems?: Array<{
        id?: string;
        name?: string;
        quantity?: number;
        weight?: number;
        observations?: string | null;
        deletedAt?: string | null;
      }>;
    }>;
    /** Legado se a API ainda enviar campos desnormalizados. */
    size?: string;
    weight?: number;
    clientName?: string | null;
  }>;
  boxes?: ContainerBoxLine[];
  /** Ordens de serviço vinculadas (quando o GET incluir a relação). */
  driverServiceOrders?: {
    id: string;
    status?: string;
    sender?: unknown;
    appointment?: { client?: { usaName?: string | null } | null } | null;
    createdAt?: string;
    attendant?: { id: string; name: string } | null;
  }[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
