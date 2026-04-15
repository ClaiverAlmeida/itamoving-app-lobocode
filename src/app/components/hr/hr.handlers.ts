import { toast } from "sonner";
import type { Usuario } from "../../api";
import { buildCreateUserPayload, buildUpdateUserPayload, type HrUserFormData } from "./hr.payload";
import { getFirstMissingRequired, isHireDateInvalid } from "./hr.utils";

export const handleCreateUsuario = async (args: {
  formUsuario: HrUserFormData;
  create: (payload: ReturnType<typeof buildCreateUserPayload>) => Promise<{ success: boolean; data?: Usuario; error?: string }>;
  addUsuario: (u: Usuario) => void;
  onSuccess: () => void;
}) => {
  const { formUsuario, create, addUsuario, onSuccess } = args;
  const missing = getFirstMissingRequired(formUsuario, false);
  if (missing) return toast.error(`Preencha o campo obrigatório: ${missing}`);
  if (isHireDateInvalid(formUsuario.birthDate, formUsuario.hireDate)) {
    return toast.error("A data de admissão não pode ser anterior à data de nascimento");
  }

  const result = await create(buildCreateUserPayload(formUsuario));
  if (result.success && result.data) {
    addUsuario(result.data);
    toast.success("Funcionário cadastrado com sucesso!");
    onSuccess();
    return;
  }
  toast.error(result.error || "Erro ao cadastrar funcionário");
};

export const handleEditUsuario = async (args: {
  selectedUsuario: Usuario;
  formUsuario: HrUserFormData;
  update: (id: string, payload: ReturnType<typeof buildUpdateUserPayload>) => Promise<{ success: boolean; data?: Usuario; error?: string }>;
  updateUsuario: (id: string, data: Usuario) => void;
  setSelectedUsuario: (u: Usuario | null) => void;
  onSuccess: () => void;
}) => {
  const { selectedUsuario, formUsuario, update, updateUsuario, setSelectedUsuario, onSuccess } = args;
  const missing = getFirstMissingRequired(formUsuario, true);
  if (missing) return toast.error(`Preencha o campo obrigatório: ${missing}`);
  if (isHireDateInvalid(formUsuario.birthDate, formUsuario.hireDate)) {
    return toast.error("A data de admissão não pode ser anterior à data de nascimento");
  }

  const patchPayload = buildUpdateUserPayload(formUsuario, selectedUsuario);
  if (Object.keys(patchPayload).length === 0) return toast.info("Nenhum campo alterado.");

  const result = await update(selectedUsuario.id!, patchPayload);
  if (result.success && result.data) {
    updateUsuario(result.data.id!, result.data);
    setSelectedUsuario(null);
    toast.success("Funcionário atualizado com sucesso!");
    onSuccess();
    return;
  }
  toast.error(result.error || "Erro ao atualizar funcionário");
};

export const handleDeleteUsuario = async (args: {
  id: string;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteUsuario: (id: string) => void;
}) => {
  const { id, remove, deleteUsuario } = args;
  const result = await remove(id);
  if (result.success) {
    deleteUsuario(id);
    toast.success("Funcionário excluído com sucesso!");
    return;
  }
  toast.error(result.error || "Erro ao excluir funcionário");
};

