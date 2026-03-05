import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
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
  UserMinus
} from 'lucide-react';
import { Funcionario, RegistroPonto, Folha, Ferias } from '../types';
import {
  BRASIL_STATES,
  EUA_STATES,
  formatCPF,
} from "../utils";

export default function RHView() {
  const {
    funcionarios,
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
    registrosPonto,
    addRegistroPonto,
    folhasPagamento,
    addFolhaPagamento,
    ferias,
    addFerias,
    updateFerias
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('funcionarios');
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form states
  const [formFuncionario, setFormFuncionario] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    hireDate: new Date().toISOString().split('T')[0],
    terminationDate: '' as string | undefined,
    position: '',
    department: '',
    salary: 0,
    contractType: 'CLT' as Funcionario['contractType'],
    status: 'ACTIVE' as Funcionario['status'],
    street: '',
    number: '',
    city: '',
    state: 'FL',
    zipCode: '',
    complement: '',
    supervisor: '',
  });

  const [formPonto, setFormPonto] = useState({
    funcionarioId: '',
    data: new Date().toISOString().split('T')[0],
    entrada: '',
    saidaAlmoco: '',
    voltaAlmoco: '',
    saida: '',
    tipo: 'normal' as 'normal' | 'falta' | 'atestado' | 'folga',
    observacoes: '',
  });

  const [formFerias, setFormFerias] = useState({
    funcionarioId: '',
    periodoAquisitivo: '',
    dataInicio: '',
    dataFim: '',
    observacoes: '',
  });

  const positions = ['Motorista', 'Ajudante de Carga', 'Atendente', 'Gerente', 'Coordenador', 'Assistente Administrativo'];
  const departments = ['Operações', 'Comercial', 'Administrativo', 'Financeiro', 'Logística'];
  // const estadosBrasil = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'PE', 'CE', 'GO'];
  // const estadosUSA = ['FL', 'NY', 'CA', 'TX', 'MA', 'NJ', 'GA', 'IL', 'PA', 'NC'];

  const dataPickerBlocked = () => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  };

  // Resetar forms
  const resetFormFuncionario = () => {
    setFormFuncionario({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birthDate: '',
      hireDate: new Date().toISOString().split('T')[0],
      terminationDate: '',
      position: '',
      department: '',
      salary: 0,
      contractType: 'CLT',
      status: 'ACTIVE',
      street: '',
      number: '',
      city: '',
      state: '',
      zipCode: '',
      complement: '',
      supervisor: '',
    });
  };

  // CRUD Funcionários
  const handleSubmitFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    const novoFuncionario: Funcionario = {
      id: Date.now().toString(),
      name: formFuncionario.name,
      email: formFuncionario.email,
      phone: formFuncionario.phone,
      cpf: formFuncionario.cpf,
      birthDate: formFuncionario.birthDate,
      hireDate: formFuncionario.hireDate,
      terminationDate: formFuncionario.terminationDate || undefined,
      position: formFuncionario.position,
      department: formFuncionario.department,
      salary: Number(formFuncionario.salary),
      contractType: formFuncionario.contractType,
      status: formFuncionario.status,
      address: {
        street: formFuncionario.street,
        number: formFuncionario.number,
        city: formFuncionario.city,
        state: formFuncionario.state,
        zipCode: formFuncionario.zipCode,
        complement: formFuncionario.complement || undefined,
      },
      documents: {},
      benefits: [],
      supervisor: formFuncionario.supervisor || undefined,
    };
    addFuncionario(novoFuncionario);
    toast.success('Funcionário cadastrado com sucesso!');
    resetFormFuncionario();
    setIsDialogOpen(false);
  };

  const handleEditFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFuncionario) return;

    updateFuncionario(selectedFuncionario.id, {
      name: formFuncionario.name,
      email: formFuncionario.email,
      phone: formFuncionario.phone,
      cpf: formFuncionario.cpf,
      birthDate: formFuncionario.birthDate,
      hireDate: formFuncionario.hireDate,
      terminationDate: formFuncionario.terminationDate || undefined,
      position: formFuncionario.position,
      department: formFuncionario.department,
      salary: Number(formFuncionario.salary),
      contractType: formFuncionario.contractType,
      status: formFuncionario.status,
      address: {
        street: formFuncionario.street,
        number: formFuncionario.number,
        city: formFuncionario.city,
        state: formFuncionario.state,
        zipCode: formFuncionario.zipCode,
        complement: formFuncionario.complement || undefined,
      },
      documents: selectedFuncionario.documents ?? {},
      benefits: selectedFuncionario.benefits ?? [],
      supervisor: formFuncionario.supervisor || undefined,
    });
    toast.success('Funcionário atualizado com sucesso!');
    resetFormFuncionario();
    setIsEditDialogOpen(false);
    setSelectedFuncionario(null);
  };

  const handleDeleteFuncionario = (id: string) => {
    const confirm = window.confirm(`Tem certeza que deseja excluir este funcionário?`);
    if (confirm) {
      deleteFuncionario(id);
      toast.success('Funcionário excluído com sucesso!');
    }
  };

  // Registrar Ponto
  const handleSubmitPonto = (e: React.FormEvent) => {
    e.preventDefault();

    const funcionario = funcionarios.find(f => f.id === formPonto.funcionarioId);
    if (!funcionario) return;

    // Calcular horas trabalhadas
    let horasTrabalhadas = 0;
    let horasExtras = 0;

    if (formPonto.entrada && formPonto.saida) {
      const [hE, mE] = formPonto.entrada.split(':').map(Number);
      const [hS, mS] = formPonto.saida.split(':').map(Number);
      let totalMinutos = (hS * 60 + mS) - (hE * 60 + mE);

      // Descontar almoço se houver
      if (formPonto.saidaAlmoco && formPonto.voltaAlmoco) {
        const [hSA, mSA] = formPonto.saidaAlmoco.split(':').map(Number);
        const [hVA, mVA] = formPonto.voltaAlmoco.split(':').map(Number);
        const almoco = (hVA * 60 + mVA) - (hSA * 60 + mSA);
        totalMinutos -= almoco;
      }

      horasTrabalhadas = totalMinutos / 60;
      if (horasTrabalhadas > 8) {
        horasExtras = horasTrabalhadas - 8;
      }
    }

    const novoPonto: RegistroPonto = {
      id: Date.now().toString(),
      funcionarioId: formPonto.funcionarioId,
      funcionarioNome: funcionario.name,
      data: formPonto.data,
      entrada: formPonto.entrada,
      saidaAlmoco: formPonto.saidaAlmoco || undefined,
      voltaAlmoco: formPonto.voltaAlmoco || undefined,
      saida: formPonto.saida || undefined,
      horasTrabalhadas: parseFloat(horasTrabalhadas.toFixed(2)),
      horasExtras: parseFloat(horasExtras.toFixed(2)),
      tipo: formPonto.tipo,
      observacoes: formPonto.observacoes,
    };

    addRegistroPonto(novoPonto);
    toast.success('Ponto registrado com sucesso!');
    setFormPonto({
      funcionarioId: '',
      data: new Date().toISOString().split('T')[0],
      entrada: '',
      saidaAlmoco: '',
      voltaAlmoco: '',
      saida: '',
      tipo: 'normal',
      observacoes: '',
    });
  };

  // Solicitar Férias
  const handleSubmitFerias = (e: React.FormEvent) => {
    e.preventDefault();

    const funcionario = funcionarios.find(f => f.id === formFerias.funcionarioId);
    if (!funcionario) return;

    const inicio = new Date(formFerias.dataInicio);
    const fim = new Date(formFerias.dataFim);
    const diasCorridos = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const novasFerias: Ferias = {
      id: Date.now().toString(),
      funcionarioId: formFerias.funcionarioId,
      funcionarioNome: funcionario.name,
      periodoAquisitivo: formFerias.periodoAquisitivo,
      dataInicio: formFerias.dataInicio,
      dataFim: formFerias.dataFim,
      diasCorridos,
      status: 'solicitado',
      observacoes: formFerias.observacoes,
    };

    addFerias(novasFerias);
    toast.success('Férias solicitadas com sucesso!');
    setFormFerias({
      funcionarioId: '',
      periodoAquisitivo: '',
      dataInicio: '',
      dataFim: '',
      observacoes: '',
    });
  };

  // Filtros
  const funcionariosFiltrados = funcionarios.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalFuncionarios = funcionarios.length;
  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ACTIVE').length;
  const funcionariosFerias = funcionarios.filter(f => f.status === 'ON_LEAVE').length;
  const folhaMesAtual = folhasPagamento
    .filter(f => f.mesReferencia === format(new Date(), 'MM/yyyy'))
    .reduce((acc, f) => acc + f.salarioLiquido, 0);

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
            Gestão completa de pessoal e departamento pessoal
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
                <span className="font-bold text-2xl">{totalFuncionarios}</span>
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
                <span className="font-bold text-2xl">{funcionariosAtivos}</span>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-orange-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Férias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">{funcionariosFerias}</span>
                <CalendarDays className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-purple-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Folha do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">${folhaMesAtual.toFixed(0)}</span>
                <Wallet className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-[600px] grid-cols-4">
          <TabsTrigger value="funcionarios">
            <Users className="w-4 h-4 mr-2" />
            Funcionários
          </TabsTrigger>
          <TabsTrigger value="ponto">
            <Clock className="w-4 h-4 mr-2" />
            Ponto
          </TabsTrigger>
          <TabsTrigger value="folha">
            <DollarSign className="w-4 h-4 mr-2" />
            Folha
          </TabsTrigger>
          <TabsTrigger value="ferias">
            <Calendar className="w-4 h-4 mr-2" />
            Férias
          </TabsTrigger>
        </TabsList>

        {/* Tab: Funcionários */}
        <TabsContent value="funcionarios" className="space-y-4">
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
                  if (!open) resetFormFuncionario();
                }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Funcionário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
                      <DialogDescription>
                        Preencha os dados completos do funcionário
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitFuncionario} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Dados Pessoais */}
                        <div className="col-span-2">
                          <Label className="text-base font-semibold">Dados Pessoais</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={formFuncionario.name}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formFuncionario.email}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            value={formFuncionario.phone}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            value={formFuncionario.cpf}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, cpf: formatCPF(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Data de Nascimento *</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            max={dataPickerBlocked()}
                            value={formFuncionario.birthDate}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, birthDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hireDate">Data de Admissão *</Label>
                          <Input
                            id="hireDate"
                            type="date"
                            value={formFuncionario.hireDate}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, hireDate: e.target.value })}
                            required
                          />
                        </div>

                        {/* Dados Profissionais */}
                        <div className="col-span-2 pt-4 border-t">
                          <Label className="text-base font-semibold">Dados Profissionais</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position *</Label>
                          <Select
                            value={formFuncionario.position}
                            onValueChange={(value) => setFormFuncionario({ ...formFuncionario, position: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map(position => (
                                <SelectItem key={position} value={position}>{position}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Departamento *</Label>
                          <Select
                            value={formFuncionario.department}
                            onValueChange={(value) => setFormFuncionario({ ...formFuncionario, department: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(department => (
                                <SelectItem key={department} value={department}>{department}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salary">Salary (USD) *</Label>
                          <Input
                            id="salary"
                            type="number"
                            step="0.01"
                            min={0}
                            value={formFuncionario.salary}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, salary: Number(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contractType">Contract Type *</Label>
                          <Select
                            value={formFuncionario.contractType}
                            onValueChange={(value: Funcionario['contractType']) => setFormFuncionario({ ...formFuncionario, contractType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CLT">CLT</SelectItem>
                              <SelectItem value="PJ">PJ</SelectItem>
                              <SelectItem value="TEMPORARY">Temporário</SelectItem>
                              <SelectItem value="INTERNSHIP">Estágio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supervisor">Supervisor</Label>
                          <Input
                            id="supervisor"
                            value={formFuncionario.supervisor}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, supervisor: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select
                            value={formFuncionario.status}
                            onValueChange={(value: any) => setFormFuncionario({ ...formFuncionario, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Ativo</SelectItem>
                              <SelectItem value="ON_LEAVE">Férias</SelectItem>
                              <SelectItem value="ABSENT">Afastado</SelectItem>
                              <SelectItem value="TERMINATED">Demitido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Endereço */}
                        <div className="col-span-2 pt-4 border-t">
                          <Label className="text-base font-semibold">Endereço</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="street">Rua *</Label>
                          <Input
                            id="street"
                            value={formFuncionario.street}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, street: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="number">Número *</Label>
                          <Input
                            id="number"
                            value={formFuncionario.number}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, number: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade *</Label>
                          <Input
                            id="city"
                            value={formFuncionario.city}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado *</Label>
                          <Select
                            value={formFuncionario.state}
                            onValueChange={(value) => setFormFuncionario({ ...formFuncionario, state: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                            value={formFuncionario.zipCode}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, zipCode: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complement">Complemento</Label>
                          <Input
                            id="complement"
                            value={formFuncionario.complement}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, complement: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
                    placeholder="Buscar por nome, cargo ou departamento..."
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
                      <TableHead className="text-center">Departamento</TableHead>
                      <TableHead className="text-center">Tipo</TableHead>
                      <TableHead className="text-center">Salário</TableHead>
                      <TableHead className="text-center">Admissão</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funcionariosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Nenhum funcionário cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      funcionariosFiltrados.map((func) => (
                        <TableRow key={func.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] text-white">
                                  {func.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{func.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {func.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-muted-foreground" />
                              {func.position}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              {func.department}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{func.contractType === 'CLT' ? 'CLT' : func.contractType === 'PJ' ? 'PJ' : func.contractType === 'TEMPORARY' ? 'Temporário' : 'Estágio'}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">
                              ${func.salary.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {format(new Date(func.hireDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                func.status === 'ACTIVE' ? 'default' :
                                  func.status === 'ON_LEAVE' ? 'secondary' :
                                    func.status === 'ABSENT' ? 'outline' :
                                      'destructive'
                              }
                            >
                              {func.status === 'ACTIVE' ? <UserCheck className="w-3 h-3 mr-1" /> : func.status === 'ON_LEAVE' ? <Sun className="w-3 h-3 mr-1" /> : func.status === 'ABSENT' ? <UserX className="w-3 h-3 mr-1" /> : <UserMinus className="w-3 h-3 mr-1" />}
                              {func.status === 'ACTIVE' ? 'Ativo' : func.status === 'ON_LEAVE' ? 'Férias' : func.status === 'ABSENT' ? 'Afastado' : 'Demitido'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFuncionario(func);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFuncionario(func);
                                  setFormFuncionario({
                                    name: func.name,
                                    email: func.email,
                                    phone: func.phone,
                                    cpf: func.cpf,
                                    birthDate: func.birthDate,
                                    hireDate: func.hireDate,
                                    terminationDate: func.terminationDate ?? '',
                                    position: func.position,
                                    department: func.department,
                                    salary: func.salary,
                                    contractType: func.contractType,
                                    status: func.status,
                                    street: func.address.street,
                                    number: func.address.number,
                                    city: func.address.city,
                                    state: func.address.state,
                                    zipCode: func.address.zipCode,
                                    complement: func.address.complement || '',
                                    supervisor: func.supervisor || '',
                                  });
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFuncionario(func.id)}
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
        </TabsContent>

        {/* Tab: Ponto */}
        <TabsContent value="ponto" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Formulário de Registro */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Registrar Ponto</CardTitle>
                <CardDescription>
                  Registre entrada e saída de funcionários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPonto} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="funcionarioPonto">Funcionário *</Label>
                    <Select
                      value={formPonto.funcionarioId}
                      onValueChange={(value) => setFormPonto({ ...formPonto, funcionarioId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {funcionarios.filter(f => f.status === 'ACTIVE').map(func => (
                          <SelectItem key={func.id} value={func.id}>{func.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataPonto">Data *</Label>
                    <Input
                      id="dataPonto"
                      type="date"
                      value={formPonto.data}
                      onChange={(e) => setFormPonto({ ...formPonto, data: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entrada">Entrada *</Label>
                    <Input
                      id="entrada"
                      type="time"
                      value={formPonto.entrada}
                      onChange={(e) => setFormPonto({ ...formPonto, entrada: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="saidaAlmoco">Saída Almoço</Label>
                      <Input
                        id="saidaAlmoco"
                        type="time"
                        value={formPonto.saidaAlmoco}
                        onChange={(e) => setFormPonto({ ...formPonto, saidaAlmoco: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voltaAlmoco">Volta Almoço</Label>
                      <Input
                        id="voltaAlmoco"
                        type="time"
                        value={formPonto.voltaAlmoco}
                        onChange={(e) => setFormPonto({ ...formPonto, voltaAlmoco: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saida">Saída</Label>
                    <Input
                      id="saida"
                      type="time"
                      value={formPonto.saida}
                      onChange={(e) => setFormPonto({ ...formPonto, saida: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoPonto">Tipo *</Label>
                    <Select
                      value={formPonto.tipo}
                      onValueChange={(value: any) => setFormPonto({ ...formPonto, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="falta">Falta</SelectItem>
                        <SelectItem value="atestado">Atestado</SelectItem>
                        <SelectItem value="folga">Folga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoesPonto">Observações</Label>
                    <Textarea
                      id="observacoesPonto"
                      value={formPonto.observacoes}
                      onChange={(e) => setFormPonto({ ...formPonto, observacoes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]">
                    <Clock className="w-4 h-4 mr-2" />
                    Registrar Ponto
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de Pontos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Registros de Ponto - Hoje</CardTitle>
                <CardDescription>
                  Visualize os registros do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Saída</TableHead>
                        <TableHead>Horas</TableHead>
                        <TableHead>Extras</TableHead>
                        <TableHead>Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrosPonto
                        .filter(p => p.data === new Date().toISOString().split('T')[0])
                        .map((ponto) => (
                          <TableRow key={ponto.id}>
                            <TableCell>{ponto.funcionarioNome}</TableCell>
                            <TableCell>{ponto.entrada}</TableCell>
                            <TableCell>{ponto.saida || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {ponto.horasTrabalhadas.toFixed(1)}h
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {ponto.horasExtras > 0 && (
                                <Badge className="bg-orange-600">
                                  +{ponto.horasExtras.toFixed(1)}h
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  ponto.tipo === 'normal' ? 'default' :
                                    ponto.tipo === 'falta' ? 'destructive' :
                                      'secondary'
                                }
                              >
                                {ponto.tipo}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {registrosPonto.filter(p => p.data === new Date().toISOString().split('T')[0]).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhum registro de ponto hoje
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Folha de Pagamento */}
        <TabsContent value="folha" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Folha de Pagamento</CardTitle>
              <CardDescription>
                Gerencie a folha de pagamento mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Mês/Ano</TableHead>
                      <TableHead>Salário Base</TableHead>
                      <TableHead>H. Extras</TableHead>
                      <TableHead>Bonificações</TableHead>
                      <TableHead>Descontos</TableHead>
                      <TableHead>Líquido</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {folhasPagamento.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhuma folha de pagamento gerada
                        </TableCell>
                      </TableRow>
                    ) : (
                      folhasPagamento.map((folha) => (
                        <TableRow key={folha.id}>
                          <TableCell className="font-medium">{folha.funcionarioNome}</TableCell>
                          <TableCell>{folha.mesReferencia}</TableCell>
                          <TableCell>${folha.salarioBase.toFixed(2)}</TableCell>
                          <TableCell className="text-green-600">
                            {folha.horasExtras > 0 && `+$${folha.horasExtras.toFixed(2)}`}
                          </TableCell>
                          <TableCell className="text-green-600">
                            {folha.bonificacoes > 0 && `+$${folha.bonificacoes.toFixed(2)}`}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {folha.descontos > 0 && `-$${folha.descontos.toFixed(2)}`}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">
                              ${folha.salarioLiquido.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                folha.status === 'pago' ? 'default' :
                                  folha.status === 'atrasado' ? 'destructive' :
                                    'secondary'
                              }
                            >
                              {folha.status === 'pago' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {folha.status === 'atrasado' && <XCircle className="w-3 h-3 mr-1" />}
                              {folha.status === 'pendente' && <AlertCircle className="w-3 h-3 mr-1" />}
                              {folha.status.charAt(0).toUpperCase() + folha.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(folha.dataPagamento), "dd/MM/yyyy")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Férias */}
        <TabsContent value="ferias" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Formulário de Solicitação */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Solicitar Férias</CardTitle>
                <CardDescription>
                  Registre solicitação de férias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitFerias} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="funcionarioFerias">Funcionário *</Label>
                    <Select
                      value={formFerias.funcionarioId}
                      onValueChange={(value) => setFormFerias({ ...formFerias, funcionarioId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {funcionarios.filter(f => f.status === 'ACTIVE').map(func => (
                          <SelectItem key={func.id} value={func.id}>{func.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodoAquisitivo">Período Aquisitivo *</Label>
                    <Input
                      id="periodoAquisitivo"
                      placeholder="Ex: 2024/2025"
                      value={formFerias.periodoAquisitivo}
                      onChange={(e) => setFormFerias({ ...formFerias, periodoAquisitivo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataInicioFerias">Data Início *</Label>
                    <Input
                      id="dataInicioFerias"
                      type="date"
                      value={formFerias.dataInicio}
                      onChange={(e) => setFormFerias({ ...formFerias, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFimFerias">Data Fim *</Label>
                    <Input
                      id="dataFimFerias"
                      type="date"
                      value={formFerias.dataFim}
                      onChange={(e) => setFormFerias({ ...formFerias, dataFim: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoesFerias">Observações</Label>
                    <Textarea
                      id="observacoesFerias"
                      value={formFerias.observacoes}
                      onChange={(e) => setFormFerias({ ...formFerias, observacoes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#F5A623] to-[#1E3A5F]">
                    <Calendar className="w-4 h-4 mr-2" />
                    Solicitar Férias
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de Férias */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Solicitações de Férias</CardTitle>
                <CardDescription>
                  Gerencie as solicitações e aprovações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ferias.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhuma solicitação de férias
                          </TableCell>
                        </TableRow>
                      ) : (
                        ferias.map((fer) => (
                          <TableRow key={fer.id}>
                            <TableCell className="font-medium">{fer.funcionarioNome}</TableCell>
                            <TableCell>{fer.periodoAquisitivo}</TableCell>
                            <TableCell>{format(new Date(fer.dataInicio), "dd/MM/yyyy")}</TableCell>
                            <TableCell>{format(new Date(fer.dataFim), "dd/MM/yyyy")}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{fer.diasCorridos} dias</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  fer.status === 'aprovado' || fer.status === 'concluído' ? 'default' :
                                    fer.status === 'cancelado' ? 'destructive' :
                                      'secondary'
                                }
                              >
                                {fer.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {fer.status === 'solicitado' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        updateFerias(fer.id, { status: 'aprovado' });
                                        toast.success('Férias aprovadas!');
                                      }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        updateFerias(fer.id, { status: 'cancelado' });
                                        toast.error('Férias canceladas!');
                                      }}
                                    >
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Visualização de Funcionário */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Detalhes do Funcionário</DialogTitle>
          </DialogHeader>
          {selectedFuncionario && (
            <div className="space-y-6 pt-1">
              {/* Header com Avatar */}
              <div className="flex items-center gap-4 pb-5 border-b border-border">
                <Avatar className="h-16 w-16 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] text-base font-semibold text-white">
                    {selectedFuncionario.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="truncate text-lg font-semibold leading-tight">{selectedFuncionario.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedFuncionario.position}</p>
                  <Badge className="mt-1.5 text-xs" variant={selectedFuncionario.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {selectedFuncionario.status === 'ACTIVE' ? 'Ativo' : selectedFuncionario.status === 'ON_LEAVE' ? 'Férias' : selectedFuncionario.status === 'ABSENT' ? 'Afastado' : 'Demitido'}
                  </Badge>
                </div>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{selectedFuncionario.email}</span>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Telefone</Label>
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {selectedFuncionario.phone}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">CPF</Label>
                  <p className="text-sm">{selectedFuncionario.cpf}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Data de Nascimento</Label>
                  <p className="text-sm">{format(new Date(selectedFuncionario.birthDate), "dd/MM/yyyy")}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Departamento</Label>
                  <p className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {selectedFuncionario.department}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Data de Admissão</Label>
                  <p className="text-sm">{format(new Date(selectedFuncionario.hireDate), "dd/MM/yyyy")}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Tipo de Contrato</Label>
                  <p className="text-sm">
                    <Badge className="font-normal" variant="outline">{selectedFuncionario.contractType === 'CLT' ? 'CLT' : selectedFuncionario.contractType === 'PJ' ? 'PJ' : selectedFuncionario.contractType === 'TEMPORARY' ? 'Temporário' : 'Estágio'}</Badge>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Salário</Label>
                  <p className="text-sm font-semibold text-green-700">
                    ${selectedFuncionario.salary.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Endereço</Label>
                  <p className="flex items-start gap-2 text-sm leading-relaxed">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>
                      {selectedFuncionario.address.street}, {selectedFuncionario.address.number}
                      {selectedFuncionario.address.complement && ` — ${selectedFuncionario.address.complement}`}
                      {" - "}
                      {selectedFuncionario.address.city}, {selectedFuncionario.address.state} {" - "} {selectedFuncionario.address.zipCode}
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
        if (!open) resetFormFuncionario();
      }
      }>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogDescription>
              Atualize os dados do funcionário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditFuncionario} className="space-y-4">
            {/* Mesmo conteúdo do formulário de cadastro */}
            <div className="grid grid-cols-2 gap-4">
              {/* Dados Pessoais */}
              <div className="col-span-2">
                <Label className="text-base font-semibold">Dados Pessoais</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEdit">Nome Completo *</Label>
                <Input
                  id="nameEdit"
                  value={formFuncionario.name}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailEdit">Email *</Label>
                <Input
                  id="emailEdit"
                  type="email"
                  value={formFuncionario.email}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneEdit">Telefone *</Label>
                <Input
                  id="phoneEdit"
                  value={formFuncionario.phone}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpfEdit">CPF *</Label>
                <Input
                  id="cpfEdit"
                  value={formFuncionario.cpf}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, cpf: formatCPF(e.target.value) })}
                  placeholder="123.456.789-00"
                  maxLength={14}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDateEdit">Data de Nascimento *</Label>
                <Input
                  id="birthDateEdit"
                  type="date"
                  max={dataPickerBlocked()}
                  value={formFuncionario.birthDate}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, birthDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDateEdit">Data de Admissão *</Label>
                <Input
                  id="hireDateEdit"
                  type="date"
                  value={formFuncionario.hireDate}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, hireDate: e.target.value })}
                  required
                />
              </div>

              {/* Dados Profissionais */}
              <div className="col-span-2 pt-4 border-t">
                <Label className="text-base font-semibold">Dados Profissionais</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionEdit">Cargo *</Label>
                <Select
                  value={formFuncionario.position}
                  onValueChange={(value) => setFormFuncionario({ ...formFuncionario, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentEdit">Departamento *</Label>
                <Select
                  value={formFuncionario.department}
                  onValueChange={(value) => setFormFuncionario({ ...formFuncionario, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryEdit">Salary (USD) *</Label>
                <Input
                  id="salaryEdit"
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={formFuncionario.salary}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, salary: Number(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractTypeEdit">Tipo de Contrato *</Label>
                <Select
                  value={formFuncionario.contractType}
                  onValueChange={(value: any) => setFormFuncionario({ ...formFuncionario, contractType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="TEMPORARY">Temporário</SelectItem>
                    <SelectItem value="INTERNSHIP">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusEdit">Status *</Label>
                <Select
                  value={formFuncionario.status}
                  onValueChange={(value: any) => setFormFuncionario({ ...formFuncionario, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="ON_LEAVE">Férias</SelectItem>
                    <SelectItem value="ABSENT">Afastado</SelectItem>
                    <SelectItem value="TERMINATED">Demitido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
