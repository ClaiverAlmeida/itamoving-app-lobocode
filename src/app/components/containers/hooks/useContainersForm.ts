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
  emptyWeight: "",
  fullWeight: "",
  trackingLink: "",
  volumeLetter: "",
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
      emptyWeight:
        container.emptyWeight !== undefined && container.emptyWeight !== null
          ? String(container.emptyWeight)
          : "",
      fullWeight:
        container.fullWeight !== undefined && container.fullWeight !== null
          ? String(container.fullWeight)
          : "",
      trackingLink: container.trackingLink || "",
      volumeLetter: container.volumeLetter || "",
    });
  };

  return {
    formData,
    setFormData,
    resetForm,
    fillFormFromContainer,
  };
}

