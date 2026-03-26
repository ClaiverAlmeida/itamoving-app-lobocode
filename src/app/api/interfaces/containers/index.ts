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
  weightLimit: number;
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
  weightLimit: number;
  trackingLink?: string;
  status: string;
  totalWeight?: number;
  boxes?: { clientId: string; clientName: string; boxNumber: string; size: string; weight: number }[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
