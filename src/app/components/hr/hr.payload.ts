import type { CreateUsersDTO, UpdateUsersDTO, Usuario } from "../../api";

export type HrUserFormData = {
  name: string;
  email: string;
  login: string;
  password: string;
  phone: string;
  cpf: string;
  birthDate: string;
  hireDate: string;
  terminationDate: string | undefined;
  role: Usuario["role"];
  salary: number;
  status: Usuario["status"];
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  complement: string;
};

export const getInitialHrUserFormData = (): HrUserFormData => ({
  name: "",
  email: "",
  login: "",
  password: "",
  phone: "",
  cpf: "",
  birthDate: "",
  hireDate: new Date().toISOString().split("T")[0],
  terminationDate: "",
  role: "" as Usuario["role"],
  salary: 0,
  status: "ACTIVE",
  street: "",
  number: "",
  city: "",
  state: "FL",
  zipCode: "",
  complement: "",
});

export const buildCreateUserPayload = (formUsuario: HrUserFormData): CreateUsersDTO => ({
  name: formUsuario.name,
  email: formUsuario.email,
  login: formUsuario.login,
  password: formUsuario.password,
  role: formUsuario.role,
  status: formUsuario.status,
  phone: formUsuario.phone,
  cpf: formUsuario.cpf,
  birthDate: formUsuario.birthDate,
  hireDate: formUsuario.hireDate,
  terminationDate: formUsuario.terminationDate || undefined,
  salary: Number(formUsuario.salary),
  address: {
    street: formUsuario.street,
    number: formUsuario.number,
    city: formUsuario.city,
    state: formUsuario.state,
    zipCode: formUsuario.zipCode,
    complement: formUsuario.complement || undefined,
  },
  documents: {},
  benefits: [],
});

const optEmpty = (v: string | undefined | null) => v === undefined || v === null || v === "";
const optChanged = (cur: string | undefined | null, orig: string | undefined | null) => {
  if (optEmpty(cur) && optEmpty(orig)) return false;
  return (cur ?? "") !== (orig ?? "");
};

export const buildUpdateUserPayload = (
  formUsuario: HrUserFormData,
  selectedUsuario: Usuario,
): UpdateUsersDTO => {
  const current = {
    name: formUsuario.name,
    email: formUsuario.email,
    login: formUsuario.login,
    password: formUsuario.password ?? undefined,
    phone: formUsuario.phone,
    cpf: formUsuario.cpf === "" ? undefined : formUsuario.cpf,
    birthDate: formUsuario.birthDate,
    hireDate: formUsuario.hireDate,
    terminationDate: formUsuario.terminationDate === "" ? undefined : formUsuario.terminationDate,
    role: formUsuario.role,
    salary: Number(formUsuario.salary),
    status: formUsuario.status,
    address: {
      street: formUsuario.street,
      number: formUsuario.number,
      city: formUsuario.city,
      state: formUsuario.state,
      zipCode: formUsuario.zipCode,
      complement: formUsuario.complement || undefined,
    },
    documents: selectedUsuario.documents ?? {},
    benefits: selectedUsuario.benefits ?? [],
  };

  const original = selectedUsuario;
  const patch: UpdateUsersDTO = {};

  if (current.name !== original.name) patch.name = current.name;
  if (current.email !== original.email) patch.email = current.email;
  if (current.login !== undefined && current.login !== original.login) patch.login = current.login;
  if (optChanged(current.password, original.password)) patch.password = current.password;
  if (current.phone !== original.phone) patch.phone = current.phone;
  if (optChanged(current.cpf, original.cpf)) patch.cpf = current.cpf;
  if (current.birthDate !== original.birthDate) patch.birthDate = current.birthDate;
  if (current.hireDate !== original.hireDate) patch.hireDate = current.hireDate;
  if (optChanged(current.terminationDate, original.terminationDate)) patch.terminationDate = current.terminationDate;
  if (current.role !== original.role) patch.role = current.role;
  if (current.salary !== original.salary) patch.salary = current.salary;
  if (current.status !== original.status) patch.status = current.status;

  const origAddr = original.address;
  const addressChanged =
    !origAddr ||
    current.address.street !== origAddr.street ||
    current.address.number !== origAddr.number ||
    current.address.city !== origAddr.city ||
    current.address.state !== origAddr.state ||
    current.address.zipCode !== origAddr.zipCode ||
    optChanged(current.address.complement, origAddr.complement);
  if (addressChanged) patch.address = current.address;

  if (current.documents !== original.documents) patch.documents = current.documents;
  if (current.benefits !== original.benefits) patch.benefits = current.benefits;

  return patch;
};

