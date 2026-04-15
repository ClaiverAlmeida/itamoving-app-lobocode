import { useState } from "react";
import type { Usuario } from "../../../api";
import { getInitialHrUserFormData } from "../hr.payload";

export function useHrForm() {
  const [formUsuario, setFormUsuario] = useState(getInitialHrUserFormData);
  const [isEditCredencialsDialogOpen, setIsEditCredencialsDialogOpen] = useState(false);

  const resetFormUsuario = () => setFormUsuario(getInitialHrUserFormData());

  const fillFormFromUsuario = (user: Usuario) => {
    setFormUsuario({
      name: user.name,
      email: user.email,
      login: user.login ?? "",
      password: "",
      phone: user.phone ?? "",
      cpf: user.cpf ?? "",
      birthDate: user.birthDate ?? "",
      hireDate: user.hireDate ?? "",
      terminationDate: user.terminationDate ?? "",
      role: user.role,
      salary: user.salary ?? "",
      status: user.status,
      street: user.address?.street ?? "",
      number: user.address?.number ?? "",
      city: user.address?.city ?? "",
      state: user.address?.state ?? "",
      zipCode: user.address?.zipCode ?? "",
      complement: user.address?.complement || "",
    });
  };

  return {
    formUsuario,
    setFormUsuario,
    resetFormUsuario,
    fillFormFromUsuario,
    isEditCredencialsDialogOpen,
    setIsEditCredencialsDialogOpen,
  };
}

