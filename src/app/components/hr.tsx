import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Download,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Calendar,
  Clock,
  Award,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Briefcase,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  CalendarDays,
  Wallet,
  Sun,
  UserMinus,
  Pencil
} from 'lucide-react';
import { Usuario } from '../types';
import {
  EUA_STATES,
  formatNumberTelephoneEUA,
} from "../utils";
import { usersService, UpdateUsersDTO, CreateUsersDTO } from '../services/hr/users.service';
import { useAuth } from "../context/AuthContext";

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
  const [isEditCredencialsDialogOpen, setIsEditCredencialsDialogOpen] = useState(false);

  useEffect(() => {
    usersService.getAll().then((result) => {
      if (result.success && result.data) setUsuarios(result.data);
    });
    return;
  }, [setUsuarios]);

  // Form states
  const [formUsuario, setFormUsuario] = useState({
    name: '',
    email: '',
    login: '',
    password: '',
    phone: '',
    cpf: '',
    birthDate: '',
    hireDate: new Date().toISOString().split('T')[0],
    terminationDate: '' as string | undefined,
    role: '' as Usuario['role'],
    salary: 0,
    status: 'ACTIVE' as Usuario['status'],
    street: '',
    number: '',
    city: '',
    state: 'FL',
    zipCode: '',
    complement: '',
  });

  const roles = ["ADMIN", "COMERCIAL", "LOGISTICS", "DRIVER"];

  const rolesLabels: Record<Usuario['role'], string> = {
    "ADMIN": "Administrador",
    "COMERCIAL": "Comercial",
    "LOGISTICS": "Logística",
    "DRIVER": "Motorista",
  }

  const statusLabels: Record<Usuario['status'], string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    PENDING: 'Pendente',
    ON_LEAVE: 'Férias',
    TERMINATED: 'Demitido',
  };

  const dataPickerBlocked = () => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  };

  const formatJustLetters = (value: string): string => {
    return value.replace(/[^\p{L}\s]/gu, '').charAt(0).toUpperCase() + value.replace(/[^\p{L}\s]/gu, '').slice(1);
  };

  // Resetar forms
  const resetFormUsuario = () => {
    setFormUsuario({
      name: '',
      email: '',
      login: '',
      password: '',
      phone: '',
      cpf: '',
      birthDate: '',
      hireDate: new Date().toISOString().split('T')[0],
      terminationDate: '',
      role: '' as Usuario['role'],
      salary: 0,
      status: 'ACTIVE',
      street: '',
      number: '',
      city: '',
      state: '',
      zipCode: '',
      complement: '',
    });
  };

  /** Retorna o nome do primeiro campo obrigatório vazio, ou null se todos preenchidos. isEdit=true não exige login/senha. */
  const getFirstMissingRequired = (isEdit?: boolean): string | null => {
    if (!formUsuario.name?.trim()) return 'Nome Completo';
    if (!formUsuario.email?.trim()) return 'Email';
    if (!isEdit) {
      if (!formUsuario.login?.trim()) return 'Login';
      if (!formUsuario.password?.trim()) return 'Senha';
    }
    if (!formUsuario.phone?.trim()) return 'Telefone';
    if (!formUsuario.birthDate) return 'Data de Nascimento';
    if (!formUsuario.hireDate) return 'Data de Admissão';
    if (!formUsuario.role?.trim()) return 'Cargo';
    if (formUsuario.salary === undefined || formUsuario.salary === null) return 'Salário';
    if (!formUsuario.status) return 'Status';
    if (!formUsuario.street?.trim()) return 'Rua';
    if (!formUsuario.number?.trim()) return 'Número';
    if (!formUsuario.city?.trim()) return 'Cidade';
    if (!formUsuario.state?.trim()) return 'Estado';
    if (!formUsuario.zipCode?.trim()) return 'CEP/Zip Code';
    return null;
  };

  // CRUD Funcionários (Usuarios)
  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = getFirstMissingRequired(false);
    if (missing) {
      toast.error(`Preencha o campo obrigatório: ${missing}`);
      return;
    }

    const birthDate = new Date(formUsuario.birthDate).getTime();
    const hireDate = new Date(formUsuario.hireDate).getTime();

    if (Number(hireDate) < Number(birthDate)) {
      toast.error('A data de admissão não pode ser anterior à data de nascimento');
      return;
    }

    const payload: CreateUsersDTO = {
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
    };

    const result = await usersService.create(payload);

    if (result.success && result.data) {
      addUsuario(result.data);
      toast.success('Funcionário cadastrado com sucesso!');
      resetFormUsuario();
      setIsDialogOpen(false);
      setIsEditCredencialsDialogOpen(false);
    }
    else if (result.error) {
      toast.error(result.error || 'Erro ao cadastrar funcionário');
    }
  };

  const handleEditUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;
    const missing = getFirstMissingRequired(true);
    if (missing) {
      toast.error(`Preencha o campo obrigatório: ${missing}`);
      return;
    }

    const birthDate = new Date(formUsuario.birthDate).getTime();
    const hireDate = new Date(formUsuario.hireDate).getTime();

    if (Number(hireDate) < Number(birthDate)) {
      toast.error('A data de admissão não pode ser anterior à data de nascimento');
      return;
    }

    /** Para campos opcionais: trata undefined, null e '' como equivalentes (vazio). */
    const optEmpty = (v: string | undefined | null) =>
      v === undefined || v === null || v === '';
    const optChanged = (
      cur: string | undefined | null,
      orig: string | undefined | null,
    ) => {
      if (optEmpty(cur) && optEmpty(orig)) return false;
      return (cur ?? '') !== (orig ?? '');
    };

    const getUpdatePayload = (): UpdateUsersDTO => {
      const current = {
        name: formUsuario.name,
        email: formUsuario.email,
        login: formUsuario.login,
        password: formUsuario.password ?? undefined,
        phone: formUsuario.phone,
        cpf: formUsuario.cpf,
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

      const original = selectedUsuario!;
      const patch: UpdateUsersDTO = {};

      if (current.name !== original.name) patch.name = current.name;
      if (current.email !== original.email) patch.email = current.email;
      if (current.login !== undefined && current.login !== original.login) patch.login = current.login;
      if (optChanged(current.password, original.password)) patch.password = current.password;
      if (current.phone !== original.phone) patch.phone = current.phone;
      if (current.cpf !== original.cpf) patch.cpf = current.cpf;
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
      if (addressChanged) {
        patch.address = {
          street: current.address.street,
          number: current.address.number,
          city: current.address.city,
          state: current.address.state,
          zipCode: current.address.zipCode,
          complement: current.address.complement,
        };
      }

      if (current.documents !== original.documents) patch.documents = current.documents;
      if (current.benefits !== original.benefits) patch.benefits = current.benefits;

      return patch;
    };

    const patchPayload = getUpdatePayload();
    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    const result = await usersService.update(selectedUsuario.id!, patchPayload);

    if (result.success && result.data) {
      updateUsuario(result.data.id!, result.data);
      toast.success('Funcionário atualizado com sucesso!');
      resetFormUsuario();
      setIsEditDialogOpen(false);
      setSelectedUsuario(null);
      setIsEditCredencialsDialogOpen(false);
    }
    else if (result.error) {
      toast.error(result.error || 'Erro ao atualizar funcionário');
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    const confirm = window.confirm(`Tem certeza que deseja excluir este funcionário?`);
    if (confirm) {
      const result = await usersService.delete(id);
      if (result.success) {
        deleteUsuario(id);
        toast.success('Funcionário excluído com sucesso!');
      } else if (result.error) {
        toast.error(result.error || 'Erro ao excluir funcionário');
      }
    }
  };

  // Filtros
  const usuariosFiltrados = usuarios.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rolesLabels[f.role].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(f => f.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            Recursos Humanos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão de funcionários e departamento pessoal
          </p>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">{totalUsuarios}</span>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">{usuariosAtivos}</span>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cadastro de Funcionários */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cadastro de Funcionários</CardTitle>
                <CardDescription>
                  Gerencie o cadastro completo da equipe
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetFormUsuario();
              }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Funcionário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[40vw] sm:max-w-[40vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
                    <DialogDescription>
                      Preencha os dados completos do funcionário
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitUsuario} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Dados Pessoais */}
                      <div className="col-span-1 sm:col-span-2">
                        <Label className="text-base font-semibold">Dados Pessoais</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={formUsuario.name}
                          onChange={(e) => setFormUsuario({ ...formUsuario, name: formatJustLetters(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formUsuario.email}
                          onBlur={(e) => setFormUsuario({ ...formUsuario, login: e.target.value })}
                          onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={formUsuario.phone}
                          onChange={(e) => setFormUsuario({ ...formUsuario, phone: formatNumberTelephoneEUA(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF/Documento</Label>
                        <Input
                          id="cpf"
                          value={formUsuario.cpf}
                          onChange={(e) => setFormUsuario({ ...formUsuario, cpf: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          max={dataPickerBlocked()}
                          value={formUsuario.birthDate}
                          onChange={(e) => setFormUsuario({ ...formUsuario, birthDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hireDate">Data de Admissão *</Label>
                        <Input
                          id="hireDate"
                          type="date"
                          value={formUsuario.hireDate}
                          onChange={(e) => setFormUsuario({ ...formUsuario, hireDate: e.target.value })}
                          required
                        />
                      </div>

                      {/* Dados Profissionais */}
                      <div className="col-span-1 sm:col-span-2 pt-4 border-t">
                        <Label className="text-base font-semibold">Dados Profissionais</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Cargo *</Label>
                        <Select
                          value={formUsuario.role}
                          onValueChange={(value: Usuario['role']) => setFormUsuario({ ...formUsuario, role: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role} value={role}>{rolesLabels[role]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salário (USD) *</Label>
                        <Input
                          id="salary"
                          type="number"
                          step="0.01"
                          min={0.01}
                          value={formUsuario.salary}
                          onChange={(e) => setFormUsuario({ ...formUsuario, salary: Number(e.target.value) || 0 })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                          value={formUsuario.status}
                          onValueChange={(value: any) => setFormUsuario({ ...formUsuario, status: value })}
                          required
                        >
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

                      {/* Endereço */}
                      <div className="col-span-1 sm:col-span-2 pt-4 border-t">
                        <Label className="text-base font-semibold">Endereço</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street">Rua *</Label>
                        <Input
                          id="street"
                          value={formUsuario.street}
                          onChange={(e) => setFormUsuario({ ...formUsuario, street: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          value={formUsuario.number}
                          onChange={(e) => setFormUsuario({ ...formUsuario, number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={formUsuario.city}
                          onChange={(e) => setFormUsuario({ ...formUsuario, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado *</Label>
                        <Select
                          value={formUsuario.state}
                          onValueChange={(value) => setFormUsuario({ ...formUsuario, state: value })}
                          required
                        >
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
                        <Input
                          id="zipCode"
                          value={formUsuario.zipCode}
                          onChange={(e) => setFormUsuario({ ...formUsuario, zipCode: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={formUsuario.complement}
                          onChange={(e) => setFormUsuario({ ...formUsuario, complement: e.target.value })}
                        />
                      </div>

                      {/* Credenciais */}
                      <div className="col-span-1 sm:col-span-2 pt-4 border-t">
                        <Label className="text-base font-semibold">Credenciais de Acesso</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login">Login *</Label>
                        <Input
                          id="login"
                          type="email"
                          value={formUsuario.login}
                          onChange={(e) => setFormUsuario({ ...formUsuario, login: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formUsuario.password}
                          onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button type="button" variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetFormUsuario();
                          setIsEditCredencialsDialogOpen(false);
                        }
                        }
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]">
                        Cadastrar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg overflow-hidden">
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
                                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <div className="font-medium flex items-center gap-2">
                                {user.name}
                                {currentUser?.id === user.id && (
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
                            {user.salary != null ? `R$ ${Number(user.salary).toFixed(2)}` : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.hireDate ? format(new Date(user.hireDate), "dd/MM/yyyy") : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              user.status === 'ACTIVE' ? 'default' :
                                user.status === 'ON_LEAVE' ? 'secondary' :
                                  user.status === 'TERMINATED' ? 'destructive' : 'outline'
                            }
                          >
                            {user.status === 'ACTIVE' ? <UserCheck className="w-3 h-3 mr-1" /> : user.status === 'ON_LEAVE' ? <Sun className="w-3 h-3 mr-1" /> : user.status === 'TERMINATED' ? <UserMinus className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                            {statusLabels[user.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUsuario(user);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={currentUser?.id === user.id ? true : false as boolean}
                              onClick={() => {
                                setSelectedUsuario(user);
                                setFormUsuario({
                                  name: user.name,
                                  email: user.email,
                                  login: user.login ?? '',
                                  password: '',
                                  phone: user.phone ?? '',
                                  cpf: user.cpf ?? '',
                                  birthDate: user.birthDate ?? '',
                                  hireDate: user.hireDate ?? '',
                                  terminationDate: user.terminationDate ?? '',
                                  role: user.role,
                                  salary: user.salary ?? 0,
                                  status: user.status,
                                  street: user.address?.street ?? '',
                                  number: user.address?.number ?? '',
                                  city: user.address?.city ?? '',
                                  state: user.address?.state ?? '',
                                  zipCode: user.address?.zipCode ?? '',
                                  complement: user.address?.complement || '',
                                });
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={currentUser?.id === user.id ? true : false as boolean}
                              onClick={() => handleDeleteUsuario(user.id!)}
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog de Visualização de Funcionário */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Detalhes do Funcionário</DialogTitle>
          </DialogHeader>
          {selectedUsuario && (
            <div className="space-y-6 pt-1">
              {/* Header com Avatar */}
              <div className="flex items-center gap-4 pb-5 border-b border-border">
                <Avatar className="h-16 w-16 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] text-base font-semibold text-white">
                    {selectedUsuario.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="truncate text-lg font-semibold leading-tight">{selectedUsuario.name}</h3>
                  <p className="text-sm text-muted-foreground">{rolesLabels[selectedUsuario.role]}</p>
                  <Badge className="mt-1.5 text-xs" variant={selectedUsuario.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {statusLabels[selectedUsuario.status]}
                  </Badge>
                </div>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
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
                    {selectedUsuario.phone ?? '-'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">CPF/Documento</Label>
                  <p className="text-sm">{selectedUsuario.cpf ?? '-'}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Data de Nascimento</Label>
                  <p className="text-sm">{selectedUsuario.birthDate ? format(new Date(selectedUsuario.birthDate), "dd/MM/yyyy") : '-'}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Data de Admissão</Label>
                  <p className="text-sm">{selectedUsuario.hireDate ? format(new Date(selectedUsuario.hireDate), "dd/MM/yyyy") : '-'}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Salário</Label>
                  <p className="text-sm font-semibold text-green-700">
                    {selectedUsuario.salary != null ? `R$ ${Number(selectedUsuario.salary).toFixed(2)}` : '-'}
                  </p>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Endereço</Label>
                  <p className="flex items-start gap-2 text-sm leading-relaxed">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>
                      {selectedUsuario.address
                        ? `${selectedUsuario.address.street}, ${selectedUsuario.address.number}${selectedUsuario.address.complement ? ` — ${selectedUsuario.address.complement}` : ''} - ${selectedUsuario.address.city}, ${selectedUsuario.address.state} - ${selectedUsuario.address.zipCode}`
                        : '-'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição - Similar ao de cadastro mas com título diferente */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          resetFormUsuario();
          setIsEditCredencialsDialogOpen(false);
        }
      }
      }>
        <DialogContent className="max-w-[40vw] sm:max-w-[40vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogDescription>
              Atualize os dados do funcionário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUsuario} className="space-y-4">
            {/* Mesmo conteúdo do formulário de cadastro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dados Pessoais */}
              <div className="col-span-1 sm:col-span-2">
                <Label className="text-base font-semibold">Dados Pessoais</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEdit">Nome Completo *</Label>
                <Input
                  id="nameEdit"
                  value={formUsuario.name}
                  onChange={(e) => setFormUsuario({ ...formUsuario, name: formatJustLetters(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailEdit">Email *</Label>
                <Input
                  id="emailEdit"
                  type="email"
                  value={formUsuario.email}
                  onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneEdit">Telefone *</Label>
                <Input
                  id="phoneEdit"
                  value={formUsuario.phone}
                  onChange={(e) => setFormUsuario({ ...formUsuario, phone: formatNumberTelephoneEUA(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpfEdit">CPF/Documento</Label>
                <Input
                  id="cpfEdit"
                  value={formUsuario.cpf}
                  onChange={(e) => setFormUsuario({ ...formUsuario, cpf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDateEdit">Data de Nascimento *</Label>
                <Input
                  id="birthDateEdit"
                  type="date"
                  max={dataPickerBlocked()}
                  value={formUsuario.birthDate}
                  onChange={(e) => setFormUsuario({ ...formUsuario, birthDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDateEdit">Data de Admissão *</Label>
                <Input
                  id="hireDateEdit"
                  type="date"
                  value={formUsuario.hireDate}
                  onChange={(e) => setFormUsuario({ ...formUsuario, hireDate: e.target.value })}
                  required
                />
              </div>

              {/* Dados Profissionais */}
              <div className="col-span-1 sm:col-span-2 pt-4 border-t">
                <Label className="text-base font-semibold">Dados Profissionais</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleEdit">Cargo *</Label>
                <Select
                  value={formUsuario.role}
                  onValueChange={(value: Usuario['role']) => setFormUsuario({ ...formUsuario, role: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{rolesLabels[role]}</SelectItem>
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
                  min={0.01}
                  value={formUsuario.salary}
                  onChange={(e) => setFormUsuario({ ...formUsuario, salary: Number(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusEdit">Status *</Label>
                <Select
                  value={formUsuario.status}
                  onValueChange={(value: any) => setFormUsuario({ ...formUsuario, status: value })}
                  required
                >
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

              {/* Endereço */}
              <div className="col-span-1 sm:col-span-2 pt-4 border-t">
                <Label className="text-base font-semibold">Endereço</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Rua *</Label>
                <Input
                  id="street"
                  value={formUsuario.street}
                  onChange={(e) => setFormUsuario({ ...formUsuario, street: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  value={formUsuario.number}
                  onChange={(e) => setFormUsuario({ ...formUsuario, number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formUsuario.city}
                  onChange={(e) => setFormUsuario({ ...formUsuario, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Select
                  key={`state-edit-${selectedUsuario?.id ?? 'new'}`}
                  value={formUsuario.state || undefined}
                  onValueChange={(value) => setFormUsuario({ ...formUsuario, state: value })}
                  required
                >
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
                <Input
                  id="zipCode"
                  value={formUsuario.zipCode}
                  onChange={(e) => setFormUsuario({ ...formUsuario, zipCode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formUsuario.complement}
                  onChange={(e) => setFormUsuario({ ...formUsuario, complement: e.target.value })}
                />
              </div>

              {/* Credenciais */}
              <div className="col-span-1 sm:col-span-2 pt-4 border-t">
                <Label className="text-base font-semibold">Credenciais de Acesso</Label>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <Button type="button" variant="default"
                  onClick={() => {
                    setIsEditCredencialsDialogOpen(!isEditCredencialsDialogOpen);
                    setFormUsuario({ ...formUsuario, password: '' });
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar Credenciais
                </Button>
              </div>

              {/* Ativar caso desejar editar as credenciais */}
              {(isEditCredencialsDialogOpen) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="loginEdit">Login *</Label>
                    <Input
                      id="loginEdit"
                      type="email"
                      value={formUsuario.login}
                      onChange={(e) => setFormUsuario({ ...formUsuario, login: e.target.value })}
                      required
                      disabled={!isEditCredencialsDialogOpen}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordEdit">Senha</Label>
                    <Input
                      id="passwordEdit"
                      type="passwordEdit"
                      value={formUsuario.password}
                      onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                      disabled={!isEditCredencialsDialogOpen}
                    />
                  </div>
                </>
              )}

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUsuario(null);
                  resetFormUsuario();
                  setIsEditCredencialsDialogOpen(false);
                }
                }>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}