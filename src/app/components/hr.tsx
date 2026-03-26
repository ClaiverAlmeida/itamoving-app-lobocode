import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import {
  Search,
  Download,
  Users,
} from 'lucide-react';
import { Usuario } from '../api';
import { useAuth } from "../context/AuthContext";
import {
  dataPickerBlocked,
  filterUsuarios,
  formatJustLetters,
  handleCreateUsuario,
  handleDeleteUsuario as handleDeleteUsuarioAction,
  handleEditUsuario as handleEditUsuarioAction,
  HR_ROLE_LABELS as rolesLabels,
  HR_ROLES as roles,
  HR_STATUS_LABELS as statusLabels,
  hrCrud,
  useHrForm,
} from "./hr/index";
import { HrMetricsCards } from "./hr/components/HrMetricsCards";
import { HrUsersTable } from "./hr/components/HrUsersTable";
import { HrViewUserDialog } from "./hr/components/HrViewUserDialog";
import { HrEditUserDialog } from "./hr/components/HrEditUserDialog";
import { HrCreateUserDialog } from "./hr/components/HrCreateUserDialog";

export default function RHView() {
  const { user: currentUser } = useAuth();
  const {
    usuarios,
    addUsuario,
    setUsuarios,
    updateUsuario,
    deleteUsuario,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const {
    formUsuario,
    setFormUsuario,
    resetFormUsuario,
    fillFormFromUsuario,
    isEditCredencialsDialogOpen,
    setIsEditCredencialsDialogOpen,
  } = useHrForm();

  useEffect(() => {
    hrCrud.getAll().then((result) => {
      if (result.success && result.data) setUsuarios(result.data);
    });
    return;
  }, [setUsuarios]);


  // CRUD Funcionários (Usuarios)
  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateUsuario({
      formUsuario,
      create: hrCrud.create,
      addUsuario,
      onSuccess: () => {
        resetFormUsuario();
        setIsDialogOpen(false);
        setIsEditCredencialsDialogOpen(false);
      },
    });
  };

  const handleEditUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;
    await handleEditUsuarioAction({
      selectedUsuario,
      formUsuario,
      update: hrCrud.update,
      updateUsuario,
      setSelectedUsuario,
      onSuccess: () => {
        resetFormUsuario();
        setIsEditDialogOpen(false);
        setIsEditCredencialsDialogOpen(false);
      },
    });
  };

  const handleDeleteUsuario = async (id: string) => {
    await handleDeleteUsuarioAction({
      id,
      remove: hrCrud.delete,
      deleteUsuario,
    });
  };

  // Filtros
  const usuariosFiltrados = filterUsuarios(usuarios, searchTerm, rolesLabels);

  // Estatísticas
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(f => f.status === 'ACTIVE').length;

  return (
    <div className="space-y-4 lg:space-y-6 p-4 sm:p-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="flex items-center gap-3 text-xl sm:text-2xl lg:text-3xl font-bold">
            <div className="p-3 bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            Recursos Humanos
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gestão de funcionários e departamento pessoal
          </p>
        </div>
      </motion.div>

      <HrMetricsCards totalUsuarios={totalUsuarios} usuariosAtivos={usuariosAtivos} />

      {/* Cadastro de Funcionários */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>Cadastro de Funcionários</CardTitle>
                <CardDescription>
                  Gerencie o cadastro completo da equipe
                </CardDescription>
              </div>
              <HrCreateUserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                formUsuario={formUsuario}
                setFormUsuario={setFormUsuario}
                roles={roles}
                rolesLabels={rolesLabels}
                dataPickerBlocked={dataPickerBlocked}
                formatJustLetters={formatJustLetters}
                resetFormUsuario={resetFormUsuario}
                setIsEditCredencialsDialogOpen={setIsEditCredencialsDialogOpen}
                onSubmit={handleSubmitUsuario}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon" className="w-full sm:w-auto">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <HrUsersTable
              usuariosFiltrados={usuariosFiltrados}
              currentUserId={currentUser?.id}
              rolesLabels={rolesLabels}
              statusLabels={statusLabels}
              onView={(user) => {
                setSelectedUsuario(user);
                setIsViewDialogOpen(true);
              }}
              onEdit={(user) => {
                setSelectedUsuario(user);
                fillFormFromUsuario(user);
                setIsEditDialogOpen(true);
              }}
              onDelete={(id) => handleDeleteUsuario(id)}
            />
          </CardContent>
        </Card>
      </motion.div>

      <HrViewUserDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        selectedUsuario={selectedUsuario}
        rolesLabels={rolesLabels}
        statusLabels={statusLabels}
      />

      <HrEditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formUsuario={formUsuario}
        setFormUsuario={setFormUsuario}
        selectedUsuario={selectedUsuario}
        roles={roles}
        rolesLabels={rolesLabels}
        isEditCredencialsDialogOpen={isEditCredencialsDialogOpen}
        setIsEditCredencialsDialogOpen={setIsEditCredencialsDialogOpen}
        dataPickerBlocked={dataPickerBlocked}
        formatJustLetters={formatJustLetters}
        resetFormUsuario={resetFormUsuario}
        setSelectedUsuario={setSelectedUsuario}
        onSubmit={handleEditUsuario}
      />
    </div>
  );
}