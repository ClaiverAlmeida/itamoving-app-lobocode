import type { Usuario } from "../../api";
import type { HrUserFormData } from "./hr.payload";

export const dataPickerBlocked = () => new Date().toISOString().split("T")[0];

export const formatJustLetters = (value: string): string => {
  const onlyLetters = value.replace(/[^\p{L}\s]/gu, "");
  return onlyLetters.charAt(0).toUpperCase() + onlyLetters.slice(1);
};

export const getFirstMissingRequired = (
  formUsuario: HrUserFormData,
  isEdit?: boolean,
): string | null => {
  if (!formUsuario.name?.trim()) return "Nome Completo";
  if (!formUsuario.email?.trim()) return "Email";
  if (!isEdit) {
    if (!formUsuario.login?.trim()) return "Login";
    if (!formUsuario.password?.trim()) return "Senha";
  }
  if (!formUsuario.phone?.trim()) return "Telefone";
  if (!formUsuario.birthDate) return "Data de Nascimento";
  if (!formUsuario.hireDate) return "Data de Admissão";
  if (!formUsuario.role?.trim()) return "Cargo";
  if (formUsuario.salary === undefined || formUsuario.salary === null) return "Salário";
  if (!formUsuario.status) return "Status";
  if (!formUsuario.street?.trim()) return "Rua";
  if (!formUsuario.number?.trim()) return "Número";
  if (!formUsuario.city?.trim()) return "Cidade";
  if (!formUsuario.state?.trim()) return "Estado";
  if (!formUsuario.zipCode?.trim()) return "CEP/Zip Code";
  return null;
};

export const isHireDateInvalid = (birthDate: string, hireDate: string) =>
  Number(new Date(hireDate).getTime()) < Number(new Date(birthDate).getTime());

export const filterUsuarios = (
  usuarios: Usuario[],
  searchTerm: string,
  roleLabels: Record<Usuario["role"], string>,
) =>
  usuarios.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleLabels[f.role].toLowerCase().includes(searchTerm.toLowerCase()),
  );

