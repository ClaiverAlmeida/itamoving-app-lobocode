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
  Wallet
} from 'lucide-react';
import { Funcionario, RegistroPonto, Folha, Ferias } from '../types';

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
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    dataAdmissao: new Date().toISOString().split('T')[0],
    cargo: '',
    departamento: '',
    salario: '',
    tipoContrato: 'CLT' as 'CLT' | 'PJ' | 'Temporário' | 'Estágio',
    status: 'ativo' as 'ativo' | 'férias' | 'afastado' | 'demitido',
    rua: '',
    numero: '',
    cidade: '',
    estado: 'FL',
    cep: '',
    complemento: '',
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

  const cargos = ['Motorista', 'Ajudante de Carga', 'Atendente', 'Gerente', 'Coordenador', 'Assistente Administrativo'];
  const departamentos = ['Operações', 'Comercial', 'Administrativo', 'Financeiro', 'Logística'];
  const estadosBrasil = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'PE', 'CE', 'GO'];
  const estadosUSA = ['FL', 'NY', 'CA', 'TX', 'MA', 'NJ', 'GA', 'IL', 'PA', 'NC'];

  // Resetar forms
  const resetFormFuncionario = () => {
    setFormFuncionario({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      dataAdmissao: new Date().toISOString().split('T')[0],
      cargo: '',
      departamento: '',
      salario: '',
      tipoContrato: 'CLT',
      status: 'ativo',
      rua: '',
      numero: '',
      cidade: '',
      estado: 'FL',
      cep: '',
      complemento: '',
      supervisor: '',
    });
  };

  // CRUD Funcionários
  const handleSubmitFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    const novoFuncionario: Funcionario = {
      id: Date.now().toString(),
      nome: formFuncionario.nome,
      email: formFuncionario.email,
      telefone: formFuncionario.telefone,
      cpf: formFuncionario.cpf,
      dataNascimento: formFuncionario.dataNascimento,
      dataAdmissao: formFuncionario.dataAdmissao,
      cargo: formFuncionario.cargo,
      departamento: formFuncionario.departamento,
      salario: parseFloat(formFuncionario.salario),
      tipoContrato: formFuncionario.tipoContrato,
      status: formFuncionario.status,
      endereco: {
        rua: formFuncionario.rua,
        numero: formFuncionario.numero,
        cidade: formFuncionario.cidade,
        estado: formFuncionario.estado,
        cep: formFuncionario.cep,
        complemento: formFuncionario.complemento,
      },
      documentos: {},
      beneficios: [],
      supervisor: formFuncionario.supervisor,
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
      nome: formFuncionario.nome,
      email: formFuncionario.email,
      telefone: formFuncionario.telefone,
      cpf: formFuncionario.cpf,
      dataNascimento: formFuncionario.dataNascimento,
      dataAdmissao: formFuncionario.dataAdmissao,
      cargo: formFuncionario.cargo,
      departamento: formFuncionario.departamento,
      salario: parseFloat(formFuncionario.salario),
      tipoContrato: formFuncionario.tipoContrato,
      status: formFuncionario.status,
      endereco: {
        rua: formFuncionario.rua,
        numero: formFuncionario.numero,
        cidade: formFuncionario.cidade,
        estado: formFuncionario.estado,
        cep: formFuncionario.cep,
        complemento: formFuncionario.complemento,
      },
      supervisor: formFuncionario.supervisor,
    });
    toast.success('Funcionário atualizado com sucesso!');
    resetFormFuncionario();
    setIsEditDialogOpen(false);
    setSelectedFuncionario(null);
  };

  const handleDeleteFuncionario = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
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
      funcionarioNome: funcionario.nome,
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
      funcionarioNome: funcionario.nome,
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
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalFuncionarios = funcionarios.length;
  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ativo').length;
  const funcionariosFerias = funcionarios.filter(f => f.status === 'férias').length;
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                          <Label htmlFor="nome">Nome Completo *</Label>
                          <Input
                            id="nome"
                            value={formFuncionario.nome}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, nome: e.target.value })}
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
                          <Label htmlFor="telefone">Telefone *</Label>
                          <Input
                            id="telefone"
                            value={formFuncionario.telefone}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, telefone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            value={formFuncionario.cpf}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, cpf: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                          <Input
                            id="dataNascimento"
                            type="date"
                            value={formFuncionario.dataNascimento}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, dataNascimento: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                          <Input
                            id="dataAdmissao"
                            type="date"
                            value={formFuncionario.dataAdmissao}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, dataAdmissao: e.target.value })}
                            required
                          />
                        </div>

                        {/* Dados Profissionais */}
                        <div className="col-span-2 pt-4 border-t">
                          <Label className="text-base font-semibold">Dados Profissionais</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cargo">Cargo *</Label>
                          <Select
                            value={formFuncionario.cargo}
                            onValueChange={(value) => setFormFuncionario({ ...formFuncionario, cargo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {cargos.map(cargo => (
                                <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="departamento">Departamento *</Label>
                          <Select
                            value={formFuncionario.departamento}
                            onValueChange={(value) => setFormFuncionario({ ...formFuncionario, departamento: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {departamentos.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salario">Salário (USD) *</Label>
                          <Input
                            id="salario"
                            type="number"
                            step="0.01"
                            value={formFuncionario.salario}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, salario: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipoContrato">Tipo de Contrato *</Label>
                          <Select
                            value={formFuncionario.tipoContrato}
                            onValueChange={(value: any) => setFormFuncionario({ ...formFuncionario, tipoContrato: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CLT">CLT</SelectItem>
                              <SelectItem value="PJ">PJ</SelectItem>
                              <SelectItem value="Temporário">Temporário</SelectItem>
                              <SelectItem value="Estágio">Estágio</SelectItem>
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
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="férias">Férias</SelectItem>
                              <SelectItem value="afastado">Afastado</SelectItem>
                              <SelectItem value="demitido">Demitido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Endereço */}
                        <div className="col-span-2 pt-4 border-t">
                          <Label className="text-base font-semibold">Endereço</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rua">Rua *</Label>
                          <Input
                            id="rua"
                            value={formFuncionario.rua}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, rua: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero">Número *</Label>
                          <Input
                            id="numero"
                            value={formFuncionario.numero}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, numero: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cidade">Cidade *</Label>
                          <Input
                            id="cidade"
                            value={formFuncionario.cidade}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, cidade: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estado">Estado *</Label>
                          <Select
                            value={formFuncionario.estado}
                            onValueChange={(value) => setFormFuncionario({ ...formFuncionario, estado: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {estadosUSA.map(estado => (
                                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cep">CEP/Zip Code *</Label>
                          <Input
                            id="cep"
                            value={formFuncionario.cep}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, cep: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complemento">Complemento</Label>
                          <Input
                            id="complemento"
                            value={formFuncionario.complemento}
                            onChange={(e) => setFormFuncionario({ ...formFuncionario, complemento: e.target.value })}
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
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Salário</TableHead>
                      <TableHead>Admissão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
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
                                  {func.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{func.nome}</div>
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
                              {func.cargo}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              {func.departamento}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{func.tipoContrato}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">
                              ${func.salario.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {format(new Date(func.dataAdmissao), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                func.status === 'ativo' ? 'default' :
                                func.status === 'férias' ? 'secondary' :
                                func.status === 'afastado' ? 'outline' :
                                'destructive'
                              }
                            >
                              {func.status === 'ativo' && <UserCheck className="w-3 h-3 mr-1" />}
                              {func.status === 'demitido' && <UserX className="w-3 h-3 mr-1" />}
                              {func.status.charAt(0).toUpperCase() + func.status.slice(1)}
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
                                    nome: func.nome,
                                    email: func.email,
                                    telefone: func.telefone,
                                    cpf: func.cpf,
                                    dataNascimento: func.dataNascimento,
                                    dataAdmissao: func.dataAdmissao,
                                    cargo: func.cargo,
                                    departamento: func.departamento,
                                    salario: func.salario.toString(),
                                    tipoContrato: func.tipoContrato,
                                    status: func.status,
                                    rua: func.endereco.rua,
                                    numero: func.endereco.numero,
                                    cidade: func.endereco.cidade,
                                    estado: func.endereco.estado,
                                    cep: func.endereco.cep,
                                    complemento: func.endereco.complemento || '',
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
                        {funcionarios.filter(f => f.status === 'ativo').map(func => (
                          <SelectItem key={func.id} value={func.id}>{func.nome}</SelectItem>
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
                        {funcionarios.filter(f => f.status === 'ativo').map(func => (
                          <SelectItem key={func.id} value={func.id}>{func.nome}</SelectItem>
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
            <DialogTitle>Detalhes do Funcionário</DialogTitle>
          </DialogHeader>
          {selectedFuncionario && (
            <div className="space-y-6">
              {/* Header com Avatar */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] text-white text-2xl">
                    {selectedFuncionario.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-xl">{selectedFuncionario.nome}</h3>
                  <p className="text-muted-foreground">{selectedFuncionario.cargo}</p>
                  <Badge className="mt-2" variant={selectedFuncionario.status === 'ativo' ? 'default' : 'secondary'}>
                    {selectedFuncionario.status}
                  </Badge>
                </div>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {selectedFuncionario.email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    {selectedFuncionario.telefone}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CPF</Label>
                  <p className="mt-1">{selectedFuncionario.cpf}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Nascimento</Label>
                  <p className="mt-1">{format(new Date(selectedFuncionario.dataNascimento), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Departamento</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4" />
                    {selectedFuncionario.departamento}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Admissão</Label>
                  <p className="mt-1">{format(new Date(selectedFuncionario.dataAdmissao), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo de Contrato</Label>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedFuncionario.tipoContrato}</Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Salário</Label>
                  <p className="mt-1 font-semibold text-green-700">
                    ${selectedFuncionario.salario.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Endereço</Label>
                  <p className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    {selectedFuncionario.endereco.rua}, {selectedFuncionario.endereco.numero}
                    {selectedFuncionario.endereco.complemento && ` - ${selectedFuncionario.endereco.complemento}`}
                    <br />
                    {selectedFuncionario.endereco.cidade}, {selectedFuncionario.endereco.estado} - {selectedFuncionario.endereco.cep}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição - Similar ao de cadastro mas com título diferente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                <Label htmlFor="nomeEdit">Nome Completo *</Label>
                <Input
                  id="nomeEdit"
                  value={formFuncionario.nome}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, nome: e.target.value })}
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
                  id="telefoneEdit"
                  value={formFuncionario.telefone}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, telefone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpfEdit">CPF *</Label>
                <Input
                  id="cpfEdit"
                  value={formFuncionario.cpf}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, cpf: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataNascimentoEdit">Data de Nascimento *</Label>
                <Input
                  id="dataNascimentoEdit"
                  type="date"
                  value={formFuncionario.dataNascimento}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, dataNascimento: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataAdmissaoEdit">Data de Admissão *</Label>
                <Input
                  id="dataAdmissaoEdit"
                  type="date"
                  value={formFuncionario.dataAdmissao}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, dataAdmissao: e.target.value })}
                  required
                />
              </div>

              {/* Dados Profissionais */}
              <div className="col-span-2 pt-4 border-t">
                <Label className="text-base font-semibold">Dados Profissionais</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargoEdit">Cargo *</Label>
                <Select
                  value={formFuncionario.cargo}
                  onValueChange={(value) => setFormFuncionario({ ...formFuncionario, cargo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map(cargo => (
                      <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamentoEdit">Departamento *</Label>
                <Select
                  value={formFuncionario.departamento}
                  onValueChange={(value) => setFormFuncionario({ ...formFuncionario, departamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salarioEdit">Salário (USD) *</Label>
                <Input
                  id="salarioEdit"
                  type="number"
                  step="0.01"
                  value={formFuncionario.salario}
                  onChange={(e) => setFormFuncionario({ ...formFuncionario, salario: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoContratoEdit">Tipo de Contrato *</Label>
                <Select
                  value={formFuncionario.tipoContrato}
                  onValueChange={(value: any) => setFormFuncionario({ ...formFuncionario, tipoContrato: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Temporário">Temporário</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
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
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="férias">Férias</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="demitido">Demitido</SelectItem>
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
