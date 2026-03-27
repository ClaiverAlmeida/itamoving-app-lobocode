import type { Container } from "../../types";

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
  volumeCapacity?: number;
  products?: Array<{
    id: string;
    boxNumber: string;
    size: string;
    weight: number;
    clientId?: string | null;
    clientName?: string | null;
  }>;
  boxes?: { clientId: string; clientName: string; boxNumber: string; size: string; weight: number }[];
  /** Ordens de serviço vinculadas (quando o GET incluir a relação). */
  driverServiceOrders?: { id: string }[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
