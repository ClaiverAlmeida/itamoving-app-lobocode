import React from "react";
import type { Usuario } from "../../../api";
import { EUA_STATES, formatNumberTelephoneEUA } from "../../../utils";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Pencil } from "lucide-react";
import type { HrUserFormData } from "../hr.payload";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formUsuario: HrUserFormData;
  setFormUsuario: React.Dispatch<React.SetStateAction<HrUserFormData>>;
  selectedUsuario: Usuario | null;
  roles: Usuario["role"][];
  rolesLabels: Record<Usuario["role"], string>;
  isEditCredencialsDialogOpen: boolean;
  setIsEditCredencialsDialogOpen: (open: boolean) => void;
  dataPickerBlocked: () => string;
  formatJustLetters: (value: string) => string;
  resetFormUsuario: () => void;
  setSelectedUsuario: (u: Usuario | null) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function HrEditUserDialog({
  open,
  onOpenChange,
  formUsuario,
  setFormUsuario,
  selectedUsuario,
  roles,
  rolesLabels,
  isEditCredencialsDialogOpen,
  setIsEditCredencialsDialogOpen,
  dataPickerBlocked,
  formatJustLetters,
  resetFormUsuario,
  setSelectedUsuario,
  onSubmit,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          resetFormUsuario();
          setIsEditCredencialsDialogOpen(false);
        }
      }}
    >
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
          <DialogDescription>Atualize os dados do funcionário</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <Label className="text-base font-semibold">Dados Pessoais</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEdit">Nome Completo *</Label>
              <Input id="nameEdit" value={formUsuario.name} onChange={(e) => setFormUsuario({ ...formUsuario, name: formatJustLetters(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailEdit">Email *</Label>
              <Input id="emailEdit" type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneEdit">Telefone *</Label>
              <Input id="phoneEdit" value={formUsuario.phone} onChange={(e) => setFormUsuario({ ...formUsuario, phone: formatNumberTelephoneEUA(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfEdit">CPF/Documento</Label>
              <Input id="cpfEdit" value={formUsuario.cpf} onChange={(e) => setFormUsuario({ ...formUsuario, cpf: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDateEdit">Data de Nascimento *</Label>
              <Input id="birthDateEdit" type="date" max={dataPickerBlocked()} value={formUsuario.birthDate} onChange={(e) => setFormUsuario({ ...formUsuario, birthDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hireDateEdit">Data de Admissão *</Label>
              <Input id="hireDateEdit" type="date" value={formUsuario.hireDate} onChange={(e) => setFormUsuario({ ...formUsuario, hireDate: e.target.value })} required />
            </div>

            <div className="col-span-1 sm:col-span-2 pt-4 border-t">
              <Label className="text-base font-semibold">Dados Profissionais</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleEdit">Cargo *</Label>
              <Select value={formUsuario.role} onValueChange={(value: Usuario["role"]) => setFormUsuario({ ...formUsuario, role: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {rolesLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryEdit">Salário (USD) *</Label>
              <Input
                id="salaryEdit"
                type="number"
                step="0.01"
                min={0.00}
                value={formUsuario.salary}
                onChange={(e) =>
                  setFormUsuario({
                    ...formUsuario,
                    salary: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusEdit">Status *</Label>
              <Select value={formUsuario.status} onValueChange={(value: any) => setFormUsuario({ ...formUsuario, status: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="ON_LEAVE">Férias</SelectItem>
                  <SelectItem value="TERMINATED">Demitido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 sm:col-span-2 pt-4 border-t">
              <Label className="text-base font-semibold">Endereço</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input id="street" value={formUsuario.street} onChange={(e) => setFormUsuario({ ...formUsuario, street: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input id="number" value={formUsuario.number} onChange={(e) => setFormUsuario({ ...formUsuario, number: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" value={formUsuario.city} onChange={(e) => setFormUsuario({ ...formUsuario, city: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Select key={`state-edit-${selectedUsuario?.id ?? "new"}`} value={formUsuario.state || undefined} onValueChange={(value) => setFormUsuario({ ...formUsuario, state: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado..." />
                </SelectTrigger>
                <SelectContent>
                  {EUA_STATES.map(({ uf, nome }) => (
                    <SelectItem key={uf} value={uf}>
                      {uf} – {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP/Zip Code *</Label>
              <Input id="zipCode" value={formUsuario.zipCode} onChange={(e) => setFormUsuario({ ...formUsuario, zipCode: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" value={formUsuario.complement} onChange={(e) => setFormUsuario({ ...formUsuario, complement: e.target.value })} />
            </div>

            <div className="col-span-1 sm:col-span-2 pt-4 border-t">
              <Label className="text-base font-semibold">Credenciais de Acesso</Label>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Button
                type="button"
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => {
                  setIsEditCredencialsDialogOpen(!isEditCredencialsDialogOpen);
                  setFormUsuario({ ...formUsuario, password: "" });
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar Credenciais
              </Button>
            </div>

            {isEditCredencialsDialogOpen && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="loginEdit">Login *</Label>
                  <Input id="loginEdit" type="email" value={formUsuario.login} onChange={(e) => setFormUsuario({ ...formUsuario, login: e.target.value })} required disabled={!isEditCredencialsDialogOpen} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordEdit">Senha</Label>
                  <Input id="passwordEdit" type="password" value={formUsuario.password} onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })} disabled={!isEditCredencialsDialogOpen} />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                onOpenChange(false);
                setSelectedUsuario(null);
                resetFormUsuario();
                setIsEditCredencialsDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

