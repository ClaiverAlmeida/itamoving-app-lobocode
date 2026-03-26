import { useState } from "react";
import type { Container } from "../../../api";
import type { ContainerFormData } from "../containers.payload";

const initialFormData: ContainerFormData = {
  number: "",
  type: "",
  seal: "",
  origin: "Miami, FL - USA",
  destination: "Santos, SP - Brasil",
  boardingDate: "",
  estimatedArrival: "",
  status: "PREPARATION",
  volume: "",
  weightLimit: "",
  trackingLink: "",
};

export function useContainersForm() {
  const [formData, setFormData] = useState<ContainerFormData>(initialFormData);

  const resetForm = () => setFormData(initialFormData);

  const fillFormFromContainer = (container: Container, toDateOnlyForInput: (value: string | null | undefined) => string) => {
    setFormData({
      number: container.number || "",
      type: container.type || "",
      seal: container.seal || "",
      origin: container.origin || "",
      destination: container.destination || "",
      boardingDate: toDateOnlyForInput(container.boardingDate),
      estimatedArrival: toDateOnlyForInput(container.estimatedArrival),
      status: container.status || "PREPARATION",
      volume: container.volume?.toString() || "0",
      weightLimit: container.weightLimit?.toString() || "0",
      trackingLink: container.trackingLink || "",
    });
  };

  return {
    formData,
    setFormData,
    resetForm,
    fillFormFromContainer,
  };
}

