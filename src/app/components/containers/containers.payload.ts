import type { Container, UpdateContainersDTO } from "../../api";

export type ContainerFormData = {
  number: string;
  type: string;
  seal: string;
  origin: string;
  destination: string;
  boardingDate: string;
  estimatedArrival: string;
  status: Container["status"];
  volume: string;
  weightLimit: string;
  trackingLink: string;
};

export const buildCreateContainerPayload = (formData: ContainerFormData) => ({
  number: formData.number,
  type: formData.type,
  seal: formData.seal,
  origin: formData.origin,
  destination: formData.destination,
  boardingDate: formData.boardingDate,
  estimatedArrival: formData.estimatedArrival,
  volume: parseFloat(formData.volume) || 0,
  trackingLink: formData.trackingLink,
  weightLimit: parseFloat(formData.weightLimit) || 0,
  status: formData.status as "PREPARATION" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED",
});

export const buildUpdateContainerPayload = (
  formData: ContainerFormData,
  original: Container,
): UpdateContainersDTO => {
  const current = buildCreateContainerPayload(formData);
  const patch: UpdateContainersDTO = {};

  if (current.number !== original.number) patch.number = current.number;
  if (current.type !== original.type) patch.type = current.type;
  if (current.seal !== original.seal) patch.seal = current.seal;
  if (current.origin !== original.origin) patch.origin = current.origin;
  if (current.destination !== original.destination) patch.destination = current.destination;
  if (current.boardingDate !== original.boardingDate) patch.boardingDate = current.boardingDate;
  if (current.estimatedArrival !== original.estimatedArrival) patch.estimatedArrival = current.estimatedArrival;
  if (current.volume !== original.volume) patch.volume = current.volume;
  if (current.weightLimit !== original.weightLimit) patch.weightLimit = current.weightLimit;
  if (current.trackingLink !== original.trackingLink) patch.trackingLink = current.trackingLink;
  if (current.status !== original.status) patch.status = current.status;

  return patch;
};

