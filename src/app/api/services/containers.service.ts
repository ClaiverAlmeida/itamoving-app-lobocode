import { Container } from "../types";
import { toDateOnly } from "../../utils";
import type { ContainersBackend, CreateContainersDTO, UpdateContainersDTO } from "../types";
import { BaseCrudService } from "./base-crud.service";

function mapBackendToFrontend(container: ContainersBackend): Container {
  const boxes = container.boxes ?? [];
  const totalWeight =
    container.totalWeight ?? boxes.reduce((s, b) => s + (b?.weight ?? 0), 0);
  return {
    id: container.id,
    number: container.number,
    type: container.type,
    seal: container.seal,
    origin: container.origin,
    destination: container.destination,
    shipmentDate: toDateOnly(container.shipmentDate),
    boardingDate: toDateOnly(container.boardingDate),
    estimatedArrival: toDateOnly(container.estimatedArrival),
    volume: container.volume,
    weightLimit: container.weightLimit ?? 0,
    trackingLink: container.trackingLink,
    status: container.status as Container["status"],
    totalWeight,
    boxes,
  };
}

export class ContainersService extends BaseCrudService<
  Container,
  ContainersBackend,
  CreateContainersDTO,
  UpdateContainersDTO
> {
  constructor() {
    super("/containers", mapBackendToFrontend, {
      listError: "Erro ao buscar containers",
      createError: "Erro ao cadastrar container",
      updateError: "Erro ao atualizar container",
      deleteError: "Erro ao excluir container",
    });
  }
}

export const containersServices = new ContainersService();
