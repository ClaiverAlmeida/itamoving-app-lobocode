import { toast } from "sonner";
import type { Container } from "../../api";
import { buildCreateContainerPayload, buildUpdateContainerPayload, type ContainerFormData } from "./containers.payload";

type CreateArgs = {
  formData: ContainerFormData;
  create: (payload: ReturnType<typeof buildCreateContainerPayload>) => Promise<{ success: boolean; data?: Container; error?: string }>;
  addContainer: (container: Container) => void;
  onSuccess: () => void;
};

type UpdateArgs = {
  selectedContainer: Container;
  formData: ContainerFormData;
  update: (id: string, payload: ReturnType<typeof buildUpdateContainerPayload>) => Promise<{ success: boolean; data?: Container; error?: string }>;
  updateContainer: (id: string, container: Partial<Container>) => void;
  setSelectedContainer: (container: Container | null) => void;
  onSuccess: () => void;
};

type DeleteArgs = {
  selectedContainer: Container;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteContainer: (id: string) => void;
  setSelectedContainer: (container: Container | null) => void;
  onSuccess: () => void;
};

const validateBoardingDate = (boardingDate: string, estimatedArrival: string) => {
  const boarding = new Date(boardingDate).getTime();
  const estimated = new Date(estimatedArrival).getTime();
  if (Number(boarding) > Number(estimated)) {
    toast.error("A data de embarque não pode ser maior que a data de chegada estimada.");
    return false;
  }
  return true;
};

export const handleCreateContainer = async (args: CreateArgs) => {
  const { formData, create, addContainer, onSuccess } = args;
  if (!validateBoardingDate(formData.boardingDate, formData.estimatedArrival)) return;

  const result = await create(buildCreateContainerPayload(formData));
  if (result.success && result.data) {
    addContainer(result.data);
    toast.success("Container cadastrado com sucesso!");
    onSuccess();
    return;
  }
  toast.error(result.error ?? "Erro ao cadastrar container.");
};

export const handleUpdateContainer = async (args: UpdateArgs) => {
  const { selectedContainer, formData, update, updateContainer, setSelectedContainer, onSuccess } = args;
  if (!validateBoardingDate(formData.boardingDate, formData.estimatedArrival)) return;

  const patchPayload = buildUpdateContainerPayload(formData, selectedContainer);
  if (Object.keys(patchPayload).length === 0) {
    toast.info("Nenhum campo alterado.");
    return;
  }

  const result = await update(selectedContainer.id!, patchPayload);
  if (result.success && result.data) {
    updateContainer(selectedContainer.id!, patchPayload);
    setSelectedContainer(result.data);
    toast.success("Container atualizado com sucesso!");
    onSuccess();
    return;
  }
  toast.error(result.error ?? "Erro ao atualizar container.");
};

export const handleDeleteContainer = async (args: DeleteArgs) => {
  const { selectedContainer, remove, deleteContainer, setSelectedContainer, onSuccess } = args;
  const result = await remove(selectedContainer.id!);
  if (result.success) {
    deleteContainer(selectedContainer.id!);
    setSelectedContainer(null);
    toast.success("Container excluído com sucesso!");
    onSuccess();
    return;
  }
  toast.error(result.error ?? "Erro ao excluir container.");
};

export const handleContainerStatusChange = async (args: {
  id: string;
  status: Container["status"];
  update: (id: string, payload: { status: Container["status"] }) => Promise<{ success: boolean; data?: Container; error?: string }>;
  updateContainer: (id: string, container: Container) => void;
  setSelectedContainer: (container: Container | null) => void;
}) => {
  const { id, status, update, updateContainer, setSelectedContainer } = args;
  const result = await update(id, { status });
  if (!result.success || !result.data) {
    toast.error(result.error ?? "Erro ao atualizar status do container.");
    return;
  }
  updateContainer(id, result.data);
  setSelectedContainer(result.data);
  toast.success("Status do container atualizado com sucesso!");
};

