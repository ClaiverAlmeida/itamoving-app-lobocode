import { useState, useEffect } from 'react';
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
  formatNumberTelephoneEUA,
} from "../utils";
import { employeesService, UpdateEmployeesDTO } from '../services/hr/employees.service';
import { EmptyStateAlert } from "./EmptyStateAlert";
import { timeClockRecordService, CreateTimeClockRecordDto } from '../services/hr/time-clock-record.service';
import { CreateVacationDto, vacationService } from '../services/hr/vacation.service';

export default function RHView() {
  const {
    funcionarios,
    addFuncionario,
    setFuncionarios,
    updateFuncionario,
    deleteFuncionario,
    registrosPonto,
    setRegistrosPonto,
    addRegistroPonto,
    folhasPagamento,
    addFolhaPagamento,
    ferias,
    setFerias,
    addFerias,
    updateFerias
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('funcionarios');
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  /**
   * Carrega os dados do backend conforme a aba ativa.
   * Assim só faz request quando o usuário entra na aba, evitando carregar tudo de uma vez.
   */
  useEffect(() => {
    if (activeTab === 'funcionarios') {
      employeesService.getAll().then((result) => {
        if (result.success && result.data) setFuncionarios(result.data);
      });
      return;
    }
    if (activeTab === 'ponto') {
      timeClockRecordService.getAll().then((result) => {
        if (result.success && result.data) setRegistrosPonto(result.data);
      });
      return;
    }

    if (activeTab === 'folha') {
      // TODO
      return;
    }

    if (activeTab === 'ferias') {
      vacationService.getAll().then((result) => {
        if (result.success && result.data) setFerias(result.data);
      });
      return;
    }
  }, [activeTab, setFuncionarios, setRegistrosPonto, setFerias,]);

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
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '',
    lunchStart: '',
    lunchEnd: '',
    clockOut: '',
    type: 'NORMAL' as RegistroPonto['type'],
    notes: '',
  });

  const [formFerias, setFormFerias] = useState({
    employeeId: '',
    employeeName: '',
    accrualPeriod: '',
    startDate: '',
    endDate: '',
    daysTaken: 0,
    status: 'REQUESTED' as Ferias['status'],
    notes: '',
  });

  const positions = ['Motorista', 'Ajudante de Carga', 'Atendente', 'Gerente', 'Coordenador', 'Assistente Administrativo'];
  const departments = ['Operações', 'Comercial', 'Administrativo', 'Financeiro', 'Logística'];

  const dataPickerBlocked = () => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  };

  const formatJustLetters = (value: string): string => {
    return value.replace(/[^\p{L}\s]/gu, '').charAt(0).toUpperCase() + value.replace(/[^\p{L}\s]/gu, '').slice(1);
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

  /** Retorna o nome do primeiro campo obrigatório vazio, ou null se todos preenchidos. */
  const getFirstMissingRequired = (): string | null => {
    if (!formFuncionario.name?.trim()) return 'Nome Completo';
    if (!formFuncionario.email?.trim()) return 'Email';
    if (!formFuncionario.phone?.trim()) return 'Telefone';
    if (!formFuncionario.cpf?.trim()) return 'CPF';
    if (!formFuncionario.birthDate) return 'Data de Nascimento';
    if (!formFuncionario.hireDate) return 'Data de Admissão';
    if (!formFuncionario.position?.trim()) return 'Cargo';
    if (!formFuncionario.department?.trim()) return 'Departamento';
    if (formFuncionario.salary === undefined || formFuncionario.salary === null) return 'Salário';
    if (!formFuncionario.contractType) return 'Tipo de Contrato';
    if (!formFuncionario.status) return 'Status';
    if (!formFuncionario.street?.trim()) return 'Rua';
    if (!formFuncionario.number?.trim()) return 'Número';
    if (!formFuncionario.city?.trim()) return 'Cidade';
    if (!formFuncionario.state?.trim()) return 'Estado';
    if (!formFuncionario.zipCode?.trim()) return 'CEP/Zip Code';
    return null;
  };

  // CRUD Funcionários
  const handleSubmitFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = getFirstMissingRequired();
    if (missing) {
      toast.error(`Preencha o campo obrigatório: ${missing}`);
      return;
    }

    const birthDate = new Date(formFuncionario.birthDate).getTime();
    const hireDate = new Date(formFuncionario.hireDate).getTime();

    if (Number(hireDate) < Number(birthDate)) {
      toast.error('A data de admissão não pode ser anterior à data de nascimento');
      return;
    }

    const payload: Funcionario = {
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

    const result = await employeesService.create(payload);

    if (result.success && result.data) {
      addFuncionario(result.data);
      toast.success('Funcionário cadastrado com sucesso!');
      resetFormFuncionario();
      setIsDialogOpen(false);
    }
    else if (result.error) {
      toast.error(result.error || 'Erro ao cadastrar funcionário');
    }
  };

  const handleEditFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFuncionario) return;
    const missing = getFirstMissingRequired();
    if (missing) {
      toast.error(`Preencha o campo obrigatório: ${missing}`);
      return;
    }

    const birthDate = new Date(formFuncionario.birthDate).getTime();
    const hireDate = new Date(formFuncionario.hireDate).getTime();

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

    const getUpdatePayload = (): UpdateEmployeesDTO => {
      const current = {
        name: formFuncionario.name,
        email: formFuncionario.email,
        phone: formFuncionario.phone,
        cpf: formFuncionario.cpf,
        birthDate: formFuncionario.birthDate,
        hireDate: formFuncionario.hireDate,
        terminationDate: formFuncionario.terminationDate === "" ? undefined : formFuncionario.terminationDate,
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
      };

      const original = selectedFuncionario!;
      const patch: UpdateEmployeesDTO = {};

      if (current.name !== original.name) patch.name = current.name;
      if (current.email !== original.email) patch.email = current.email;
      if (current.phone !== original.phone) patch.phone = current.phone;
      if (current.cpf !== original.cpf) patch.cpf = current.cpf;
      if (current.birthDate !== original.birthDate) patch.birthDate = current.birthDate;
      if (current.hireDate !== original.hireDate) patch.hireDate = current.hireDate;
      if (optChanged(current.terminationDate, original.terminationDate)) patch.terminationDate = current.terminationDate;
      if (current.position !== original.position) patch.position = current.position;
      if (current.department !== original.department) patch.department = current.department;
      if (current.salary !== original.salary) patch.salary = current.salary;
      if (current.contractType !== original.contractType) patch.contractType = current.contractType;
      if (current.status !== original.status) patch.status = current.status;
      const addressChanged =
        current.address.street !== original.address.street ||
        current.address.number !== original.address.number ||
        current.address.city !== original.address.city ||
        current.address.state !== original.address.state ||
        current.address.zipCode !== original.address.zipCode ||
        optChanged(current.address.complement, original.address?.complement);
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
      if (optChanged(current.supervisor, original.supervisor)) patch.supervisor = current.supervisor;

      return patch;
    };

    const patchPayload = getUpdatePayload();
    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    const result = await employeesService.update(selectedFuncionario.id!, patchPayload);

    if (result.success && result.data) {
      updateFuncionario(result.data.id!, result.data);
      toast.success('Funcionário atualizado com sucesso!');
      resetFormFuncionario();
      setIsEditDialogOpen(false);
      setSelectedFuncionario(null);
    }
    else if (result.error) {
      toast.error(result.error || 'Erro ao atualizar funcionário');
    }
  };

  const handleDeleteFuncionario = async (id: string) => {
    const confirm = window.confirm(`Tem certeza que deseja excluir este funcionário?`);
    if (confirm) {
      const result = await employeesService.delete(id);
      if (result.success) {
        deleteFuncionario(id);
        toast.success('Funcionário excluído com sucesso!');
      } else if (result.error) {
        toast.error(result.error || 'Erro ao excluir funcionário');
      }
    }
  };

  // Registrar Ponto
  const handleSubmitPonto = async (e: React.FormEvent) => {
    e.preventDefault();

    const funcionario = funcionarios.find(f => f.id === formPonto.employeeId);
    if (!funcionario || funcionario.status !== 'ACTIVE') {
      toast.error('Funcionário não encontrado ou não está ativo');
      return;
    }

    // Calcular horas trabalhadas
    let horasTrabalhadas = 0;
    let horasExtras = 0;

    if (formPonto.clockIn && formPonto.clockOut) {
      if (formPonto.clockIn >= formPonto.clockOut) {
        toast.error('A hora de entrada não pode ser maior ou igual à hora de saída');
        return;
      }

      if (formPonto.lunchStart && formPonto.lunchEnd) {
        const toMin = (hhmm: string) => {
          const [h, m] = hhmm.split(':').map(Number);
          return h * 60 + m;
        };
        const [tEntrada, tSaidaAlmoco, tVoltaAlmoco, tSaida] = [
          toMin(formPonto.clockIn),
          toMin(formPonto.lunchStart),
          toMin(formPonto.lunchEnd),
          toMin(formPonto.clockOut),
        ];
        const ordemValida = tEntrada < tSaidaAlmoco && tSaidaAlmoco < tVoltaAlmoco && tVoltaAlmoco < tSaida;
        if (!ordemValida) {
          toast.error('As horas devem seguir a ordem: Entrada → Saída almoço → Volta almoço → Saída');
          return;
        }
      }

      const [hE, mE] = formPonto.clockIn.split(':').map(Number);
      const [hS, mS] = formPonto.clockOut.split(':').map(Number);
      let totalMinutos = (hS * 60 + mS) - (hE * 60 + mE);

      // Descontar almoço se houver
      if (formPonto.lunchStart && formPonto.lunchEnd) {
        const [hSA, mSA] = formPonto.lunchStart.split(':').map(Number);
        const [hVA, mVA] = formPonto.lunchEnd.split(':').map(Number);
        const almoco = (hVA * 60 + mVA) - (hSA * 60 + mSA);
        totalMinutos -= almoco;
      }

      horasTrabalhadas = totalMinutos / 60;
      if (horasTrabalhadas > 8) {
        horasExtras = horasTrabalhadas - 8;
      }
    }

    const payload: CreateTimeClockRecordDto = {
      employeeId: formPonto.employeeId,
      employeeName: funcionario.name,
      date: formPonto.date,
      clockIn: formPonto.clockIn,
      lunchStart: formPonto.lunchStart || '',
      lunchEnd: formPonto.lunchEnd || '',
      clockOut: formPonto.clockOut || '',
      workedHours: parseFloat(horasTrabalhadas.toFixed(2)),
      overtimeHours: parseFloat(horasExtras.toFixed(2)),
      type: formPonto.type as "NORMAL" | "ABSENCE" | "SICK_NOTE" | "DAY_OFF",
      notes: formPonto.notes || '',
    };

    const result = await timeClockRecordService.create(payload);
    if (result.success && result.data) {
      addRegistroPonto(result.data);
      toast.success('Ponto registrado com sucesso!');
      setFormPonto({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        clockIn: '',
        lunchStart: '',
        lunchEnd: '',
        clockOut: '',
        type: 'NORMAL' as "NORMAL" | "ABSENCE" | "SICK_NOTE" | "DAY_OFF",
        notes: '',
      });
    } else if (result.error) {
      toast.error(result.error || 'Erro ao registrar ponto');
    }

  };

  // Solicitar Férias
  const handleSubmitFerias = async (e: React.FormEvent) => {
    e.preventDefault();

    const funcionario = funcionarios.find(f => f.id === formFerias.employeeId);
    if (!funcionario || funcionario.status !== 'ACTIVE') {
      toast.error('Funcionário não encontrado');
      return;
    }

    const inicio = new Date(formFerias.startDate);
    const fim = new Date(formFerias.endDate);
    const diasCorridos = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const payload: CreateVacationDto = {
      employeeId: formFerias.employeeId,
      employeeName: funcionario.name,
      accrualPeriod: formFerias.accrualPeriod,
      startDate: formFerias.startDate,
      endDate: formFerias.endDate,
      daysTaken: diasCorridos,
      status: formFerias.status as Ferias['status'],
      notes: formFerias.notes || '',
    };

    if (formFerias.startDate >= formFerias.endDate) {
      toast.error('A data de início não pode ser maior ou igual à data de fim.');
      return;
    }

    const result = await vacationService.create(payload);

    if (result.success && result.data) {
      addFerias(result.data);
      toast.success('Férias solicitadas com sucesso!');
      setFormFerias({
        employeeId: '',
        employeeName: '',
        accrualPeriod: '',
        startDate: '',
        endDate: '',
        daysTaken: 0,
        status: 'REQUESTED' as Ferias['status'],
        notes: '',
      });
    } else if (result.error) {
      toast.error(result.error || 'Erro ao solicitar férias');
    }
  };

  // Editar Férias - Acões
  const handleEditFerias = async (e: React.FormEvent) => {
    e.preventDefault();
  }

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
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, name: formatJustLetters(e.target.value) })}
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
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, phone: formatNumberTelephoneEUA(e.target.value) })}
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
                          <Label htmlFor="position">Cargo *</Label>
                          <Select
                            value={formFuncionario.position}
                            onValueChange={(value) => setFormFuncionario({ ...formFuncionario, position: value })}
                            required
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
                            required
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
                          <Label htmlFor="salary">Salário (USD) *</Label>
                          <Input
                            id="salary"
                            type="number"
                            step="0.01"
                            min={0.01}
                            value={formFuncionario.salary}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, salary: Number(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contractType">Tipo de Contrato *</Label>
                          <Select
                            value={formFuncionario.contractType}
                            onValueChange={(value: Funcionario['contractType']) => setFormFuncionario({ ...formFuncionario, contractType: value })}
                            required
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
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, supervisor: formatJustLetters(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select
                            value={formFuncionario.status}
                            onValueChange={(value: any) => setFormFuncionario({ ...formFuncionario, status: value })}
                            required
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
                        <Button type="button" variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            resetFormFuncionario();
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
                      <TableRow className="text-center">
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Nenhum funcionário cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      funcionariosFiltrados.map((func) => (
                        <TableRow key={func.id} className="hover:bg-muted/30">
                          <TableCell className="text-center">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] text-white">
                                  {func.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <div className="font-medium">{func.name}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {func.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-muted-foreground" />
                              {func.position}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              {func.department}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{func.contractType === 'CLT' ? 'CLT' : func.contractType === 'PJ' ? 'PJ' : func.contractType === 'TEMPORARY' ? 'Temporário' : 'Estágio'}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-green-700">
                              ${func.salary.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {format(new Date(func.hireDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-center">
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
                                    state: func.address.state ?? '',
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
                      value={formPonto.employeeId}
                      disabled={funcionarios.length === 0 || !funcionarios.some(f => f.status === 'ACTIVE')}
                      onValueChange={(value) => setFormPonto({ ...formPonto, employeeId: value })}
                      required
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

                  {/* Alertas */}
                  {(funcionarios.length === 0 || !funcionarios.some(f => f.status === 'ACTIVE')) && (
                    <EmptyStateAlert
                      title="Nenhum funcionário ativo encontrado"
                      description="Não há funcionários ativos para registrar ponto. Cadastre um funcionário ou ative um existente."
                    />
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="dataPonto">Data *</Label>
                    <Input
                      id="dataPonto"
                      type="date"
                      value={formPonto.date}
                      onChange={(e) => setFormPonto({ ...formPonto, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entrada">Entrada *</Label>
                    <Input
                      id="entrada"
                      type="time"
                      value={formPonto.clockIn}
                      onChange={(e) => setFormPonto({ ...formPonto, clockIn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="lunchStart">Saída Almoço</Label>
                      <Input
                        id="lunchStart"
                        type="time"
                        value={formPonto.lunchStart}
                        onChange={(e) => setFormPonto({ ...formPonto, lunchStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lunchEnd">Volta Almoço</Label>
                      <Input
                        id="lunchEnd"
                        type="time"
                        value={formPonto.lunchEnd}
                        onChange={(e) => setFormPonto({ ...formPonto, lunchEnd: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clockOut">Saída</Label>
                    <Input
                      id="clockOut"
                      type="time"
                      value={formPonto.clockOut}
                      onChange={(e) => setFormPonto({ ...formPonto, clockOut: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="typePonto">Tipo *</Label>
                    <Select
                      value={formPonto.type}
                      onValueChange={(value: "NORMAL" | "ABSENCE" | "SICK_NOTE" | "DAY_OFF") => setFormPonto({ ...formPonto, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="ABSENCE">Falta</SelectItem>
                        <SelectItem value="SICK_NOTE">Atestado</SelectItem>
                        <SelectItem value="DAY_OFF">Folga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notesPonto">Observações</Label>
                    <Textarea
                      id="notesPonto"
                      value={formPonto.notes}
                      onChange={(e) => setFormPonto({ ...formPonto, notes: e.target.value })}
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
                        <TableHead className="text-center">Funcionário</TableHead>
                        <TableHead className="text-center">Entrada</TableHead>
                        <TableHead className="text-center">Saída</TableHead>
                        <TableHead className="text-center">Horas</TableHead>
                        <TableHead className="text-center">Extras</TableHead>
                        <TableHead className="text-center">Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrosPonto
                        .filter(p => p.date === new Date().toISOString().split('T')[0])
                        .map((ponto) => (
                          <TableRow key={ponto.id}>
                            <TableCell className="text-center">{ponto.employeeName}</TableCell>
                            <TableCell className="text-center">{ponto.clockIn}</TableCell>
                            <TableCell className="text-center">{ponto.clockOut || '-'}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {ponto.workedHours.toFixed(1)}h
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {ponto.overtimeHours > 0 && (
                                <Badge className="bg-orange-600">
                                  +{ponto.overtimeHours.toFixed(1)}h
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  ponto.type === 'NORMAL' ? 'default' :
                                    ponto.type === 'ABSENCE' ? 'destructive' :
                                      ponto.type === 'SICK_NOTE' ? 'secondary' :
                                        ponto.type === 'DAY_OFF' ? 'secondary' :
                                          'secondary'
                                }
                              >
                                {ponto.type === 'NORMAL' ? 'Normal' : ponto.type === 'ABSENCE' ? 'Falta' : ponto.type === 'SICK_NOTE' ? 'Atestado' : ponto.type === 'DAY_OFF' ? 'Folga' : ''}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {registrosPonto.filter(p => p.date === new Date().toISOString().split('T')[0]).length === 0 && (
                        <TableRow className="text-center">
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
                      value={formFerias.employeeId}
                      disabled={funcionarios.length === 0 || !funcionarios.some(f => f.status === 'ACTIVE')}
                      onValueChange={(value) => setFormFerias({ ...formFerias, employeeId: value })}
                      required
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

                  {/* Alertas */}
                  {(funcionarios.length === 0 || !funcionarios.some(f => f.status === 'ACTIVE')) && (
                    <EmptyStateAlert
                      title="Nenhum funcionário ativo encontrado"
                      description="Não há funcionários ativos para solicitar férias. Cadastre um funcionário ou ative um existente."
                    />
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="accrualPeriod">Período Aquisitivo *</Label>
                    <Input
                      id="accrualPeriod"
                      placeholder="Ex: 2024/2025"
                      value={formFerias.accrualPeriod}
                      onChange={(e) => setFormFerias({ ...formFerias, accrualPeriod: e.target.value })}
                      required
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formFerias.startDate}
                      onChange={(e) => setFormFerias({ ...formFerias, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Fim *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formFerias.endDate}
                      onChange={(e) => setFormFerias({ ...formFerias, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formFerias.notes}
                      onChange={(e) => setFormFerias({ ...formFerias, notes: e.target.value })}
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
                        <TableHead className="text-center">Funcionário</TableHead>
                        <TableHead className="text-center">Período</TableHead>
                        <TableHead className="text-center">Início</TableHead>
                        <TableHead className="text-center">Fim</TableHead>
                        <TableHead className="text-center">Dias</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ferias.length === 0 ? (
                        <TableRow className="text-center">
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhuma solicitação de férias
                          </TableCell>
                        </TableRow>
                      ) : (
                        ferias.map((fer, index) => (
                          <TableRow key={fer.id ?? `fer-${index}`} className="text-center">
                            <TableCell className="font-medium">{fer.employeeName}</TableCell>
                            <TableCell>{fer.accrualPeriod}</TableCell>
                            <TableCell>{format(new Date(fer.startDate), "dd/MM/yyyy")}</TableCell>
                            <TableCell>{format(new Date(fer.endDate), "dd/MM/yyyy")}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{fer.daysTaken} dias</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  fer.status === 'APPROVED' || fer.status === 'COMPLETED' ? 'default' :
                                    fer.status === 'CANCELLED' ? 'destructive' : fer.status === 'IN_PROGRESS' ? 'warning' :
                                      'secondary'
                                }
                              >
                                {fer.status === 'APPROVED' ? 'Aprovado' : fer.status === 'COMPLETED' ? 'Concluído' : fer.status === 'IN_PROGRESS' ? 'Em andamento' : fer.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                              </Badge>
                            </TableCell >
                            <TableCell className="text-center">
                              <div className="flex gap-2">
                                {fer.status === 'REQUESTED' && fer.id && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        updateFerias(fer.id!, { status: 'APPROVED' });
                                        toast.success('Férias aprovadas!');
                                      }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        updateFerias(fer.id!, { status: 'CANCELLED' });
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
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, name: formatJustLetters(e.target.value) })}
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
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, phone: formatNumberTelephoneEUA(e.target.value) })}
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
                  required
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
                  required
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
                <Label htmlFor="salaryEdit">Salário (USD) *</Label>
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
                  required
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
                  required
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
                  key={`state-edit-${selectedFuncionario?.id ?? 'new'}`}
                  value={formFuncionario.state || undefined}
                  onValueChange={(value) => setFormFuncionario({ ...formFuncionario, state: value })}
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
              <Button type="button" variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedFuncionario(null);
                  resetFormFuncionario();
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
