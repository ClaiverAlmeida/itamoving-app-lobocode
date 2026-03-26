import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Usuario } from "../../../api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsuario: Usuario | null;
  rolesLabels: Record<Usuario["role"], string>;
  statusLabels: Record<Usuario["status"], string>;
};

export function HrViewUserDialog({
  open,
  onOpenChange,
  selectedUsuario,
  rolesLabels,
  statusLabels,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Detalhes do Funcionário</DialogTitle>
        </DialogHeader>
        {selectedUsuario && (
          <div className="space-y-6 pt-1">
            <div className="flex items-center gap-4 pb-5 border-b border-border">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] text-base font-semibold text-white">
                  {selectedUsuario.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="truncate text-lg font-semibold leading-tight">{selectedUsuario.name}</h3>
                <p className="text-sm text-muted-foreground">{rolesLabels[selectedUsuario.role]}</p>
                <Badge className="mt-1.5 text-xs" variant={selectedUsuario.status === "ACTIVE" ? "default" : "secondary"}>
                  {statusLabels[selectedUsuario.status]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <p className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{selectedUsuario.email}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Telefone</Label>
                <p className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {selectedUsuario.phone ?? "-"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">CPF/Documento</Label>
                <p className="text-sm">{selectedUsuario.cpf ?? "-"}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Data de Nascimento</Label>
                <p className="text-sm">{selectedUsuario.birthDate ? format(new Date(selectedUsuario.birthDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Data de Admissão</Label>
                <p className="text-sm">{selectedUsuario.hireDate ? format(new Date(selectedUsuario.hireDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Salário</Label>
                <p className="text-sm font-semibold text-green-700">
                  {selectedUsuario.salary != null ? `R$ ${Number(selectedUsuario.salary).toFixed(2)}` : "-"}
                </p>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Endereço</Label>
                <p className="flex items-start gap-2 text-sm leading-relaxed">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {selectedUsuario.address
                      ? `${selectedUsuario.address.street}, ${selectedUsuario.address.number}${selectedUsuario.address.complement ? ` — ${selectedUsuario.address.complement}` : ""} - ${selectedUsuario.address.city}, ${selectedUsuario.address.state} - ${selectedUsuario.address.zipCode}`
                      : "-"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

