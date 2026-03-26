import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Mail, UserCheck, UserMinus, UserX, Eye, Edit, Trash2, Briefcase, Sun } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import type { Usuario } from "../../../api";

type Props = {
  usuariosFiltrados: Usuario[];
  currentUserId?: string;
  rolesLabels: Record<Usuario["role"], string>;
  statusLabels: Record<Usuario["status"], string>;
  onView: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
  onDelete: (id: string) => void;
};

export function HrUsersTable({
  usuariosFiltrados,
  currentUserId,
  rolesLabels,
  statusLabels,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="border rounded-lg overflow-hidden overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-center">Funcionário</TableHead>
            <TableHead className="text-center">Cargo</TableHead>
            <TableHead className="text-center">Salário</TableHead>
            <TableHead className="text-center">Admissão</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuariosFiltrados.length === 0 ? (
            <TableRow className="text-center">
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhum funcionário cadastrado
              </TableCell>
            </TableRow>
          ) : (
            usuariosFiltrados.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/30">
                <TableCell className="text-center">
                  <div className="flex items-center justify-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] text-white">
                        {user.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        {user.name}
                        {currentUserId === user.id && (
                          <span className="text-xs text-muted-foreground font-normal">(Você)</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    {rolesLabels[user.role]}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold text-green-700">
                    {user.salary != null ? `R$ ${Number(user.salary).toFixed(2)}` : "-"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {user.hireDate ? format(new Date(user.hireDate), "dd/MM/yyyy") : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      user.status === "ACTIVE"
                        ? "default"
                        : user.status === "ON_LEAVE"
                          ? "secondary"
                          : user.status === "TERMINATED"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {user.status === "ACTIVE" ? (
                      <UserCheck className="w-3 h-3 mr-1" />
                    ) : user.status === "ON_LEAVE" ? (
                      <Sun className="w-3 h-3 mr-1" />
                    ) : user.status === "TERMINATED" ? (
                      <UserMinus className="w-3 h-3 mr-1" />
                    ) : (
                      <UserX className="w-3 h-3 mr-1" />
                    )}
                    {statusLabels[user.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(user)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentUserId === user.id}
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentUserId === user.id}
                      onClick={() => user.id && onDelete(user.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

