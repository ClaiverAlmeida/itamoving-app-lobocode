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
import { Switch } from './ui/switch';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search,
  Download,
  DollarSign,
  MapPin,
  Package,
  Edit,
  Trash2,
  Tag,
  Box,
  TrendingUp,
  Archive,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Ruler,
  Weight
} from 'lucide-react';
import { PrecoEntrega, PrecoProduto } from '../types';

export default function PrecosView() {
  const { precosEntrega, precosProdutos, addPrecoEntrega, updatePrecoEntrega, deletePrecoEntrega, addPrecoProduto, updatePrecoProduto, deletePrecoProduto } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('entregas');
  
  // Estados para Preços de Entrega
  const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
  const [isEditEntregaDialogOpen, setIsEditEntregaDialogOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<PrecoEntrega | null>(null);
  const [formEntrega, setFormEntrega] = useState({
    cidadeOrigem: '',
    estadoOrigem: 'FL',
    cidadeDestino: '',
    estadoDestino: 'SP',
    precoPorKg: '',
    precoMinimo: '',
    prazoEntrega: '',
    ativo: true,
  });

  // Estados para Produtos
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false);
  const [isEditProdutoDialogOpen, setIsEditProdutoDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<PrecoProduto | null>(null);
  const [formProduto, setFormProduto] = useState({
    tipo: 'caixa' as 'caixa' | 'fita',
    nome: '',
    tamanho: '',
    dimensoes: '',
    pesoMaximo: '',
    unidade: 'unidade',
    precoCusto: '',
    precoVenda: '',
    estoque: '',
    estoqueMinimo: '',
    ativo: true,
  });

  // Estados dos EUA mais comuns
  const estadosUSA = ['FL', 'NY', 'CA', 'TX', 'MA', 'NJ', 'GA', 'IL', 'PA', 'NC'];
  const estadosBrasil = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'PE', 'CE', 'GO'];

  // Funções para Preços de Entrega
  const resetFormEntrega = () => {
    setFormEntrega({
      cidadeOrigem: '',
      estadoOrigem: 'FL',
      cidadeDestino: '',
      estadoDestino: 'SP',
      precoPorKg: '',
      precoMinimo: '',
      prazoEntrega: '',
      ativo: true,
    });
  };

  const handleSubmitEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    const novoPreco: PrecoEntrega = {
      id: Date.now().toString(),
      cidadeOrigem: formEntrega.cidadeOrigem,
      estadoOrigem: formEntrega.estadoOrigem,
      cidadeDestino: formEntrega.cidadeDestino,
      estadoDestino: formEntrega.estadoDestino,
      precoPorKg: parseFloat(formEntrega.precoPorKg),
      precoMinimo: parseFloat(formEntrega.precoMinimo),
      prazoEntrega: parseInt(formEntrega.prazoEntrega),
      ativo: formEntrega.ativo,
    };
    addPrecoEntrega(novoPreco);
    toast.success('Preço de entrega cadastrado com sucesso!');
    resetFormEntrega();
    setIsEntregaDialogOpen(false);
  };

  const handleEditEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntrega) return;
    
    updatePrecoEntrega(selectedEntrega.id, {
      cidadeOrigem: formEntrega.cidadeOrigem,
      estadoOrigem: formEntrega.estadoOrigem,
      cidadeDestino: formEntrega.cidadeDestino,
      estadoDestino: formEntrega.estadoDestino,
      precoPorKg: parseFloat(formEntrega.precoPorKg),
      precoMinimo: parseFloat(formEntrega.precoMinimo),
      prazoEntrega: parseInt(formEntrega.prazoEntrega),
      ativo: formEntrega.ativo,
    });
    toast.success('Preço de entrega atualizado com sucesso!');
    resetFormEntrega();
    setIsEditEntregaDialogOpen(false);
    setSelectedEntrega(null);
  };

  const handleDeleteEntrega = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este preço de entrega?')) {
      deletePrecoEntrega(id);
      toast.success('Preço de entrega excluído com sucesso!');
    }
  };

  // Funções para Produtos
  const resetFormProduto = () => {
    setFormProduto({
      tipo: 'caixa',
      nome: '',
      tamanho: '',
      dimensoes: '',
      pesoMaximo: '',
      unidade: 'unidade',
      precoCusto: '',
      precoVenda: '',
      estoque: '',
      estoqueMinimo: '',
      ativo: true,
    });
  };

  const handleSubmitProduto = (e: React.FormEvent) => {
    e.preventDefault();
    const novoProduto: PrecoProduto = {
      id: Date.now().toString(),
      tipo: formProduto.tipo,
      nome: formProduto.nome,
      tamanho: formProduto.tamanho || undefined,
      dimensoes: formProduto.dimensoes || undefined,
      pesoMaximo: formProduto.pesoMaximo ? parseFloat(formProduto.pesoMaximo) : undefined,
      unidade: formProduto.unidade,
      precoCusto: parseFloat(formProduto.precoCusto),
      precoVenda: parseFloat(formProduto.precoVenda),
      estoque: parseInt(formProduto.estoque),
      estoqueMinimo: parseInt(formProduto.estoqueMinimo),
      ativo: formProduto.ativo,
    };
    addPrecoProduto(novoProduto);
    toast.success('Produto cadastrado com sucesso!');
    resetFormProduto();
    setIsProdutoDialogOpen(false);
  };

  const handleEditProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduto) return;
    
    updatePrecoProduto(selectedProduto.id, {
      tipo: formProduto.tipo,
      nome: formProduto.nome,
      tamanho: formProduto.tamanho || undefined,
      dimensoes: formProduto.dimensoes || undefined,
      pesoMaximo: formProduto.pesoMaximo ? parseFloat(formProduto.pesoMaximo) : undefined,
      unidade: formProduto.unidade,
      precoCusto: parseFloat(formProduto.precoCusto),
      precoVenda: parseFloat(formProduto.precoVenda),
      estoque: parseInt(formProduto.estoque),
      estoqueMinimo: parseInt(formProduto.estoqueMinimo),
      ativo: formProduto.ativo,
    });
    toast.success('Produto atualizado com sucesso!');
    resetFormProduto();
    setIsEditProdutoDialogOpen(false);
    setSelectedProduto(null);
  };

  const handleDeleteProduto = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deletePrecoProduto(id);
      toast.success('Produto excluído com sucesso!');
    }
  };

  // Filtros
  const entregasFiltradas = precosEntrega.filter(p => 
    p.cidadeOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cidadeDestino.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.estadoOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.estadoDestino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosFiltrados = precosProdutos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.tamanho && p.tamanho.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular margem de lucro
  const calcularMargem = (custo: number, venda: number) => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo * 100).toFixed(1);
  };

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
              <Tag className="w-8 h-8 text-white" />
            </div>
            Tabelas de Preços
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie preços de entregas e produtos
          </p>
        </div>
      </motion.div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rotas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">{precosEntrega.filter(p => p.ativo).length}</span>
                <MapPin className="w-8 h-8 text-blue-600" />
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
                Produtos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">{precosProdutos.filter(p => p.ativo).length}</span>
                <Package className="w-8 h-8 text-green-600" />
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
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">
                  {precosProdutos.filter(p => p.estoque <= p.estoqueMinimo).length}
                </span>
                <AlertCircle className="w-8 h-8 text-orange-600" />
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
                Valor Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">
                  ${precosProdutos.reduce((acc, p) => acc + (p.precoVenda * p.estoque), 0).toFixed(0)}
                </span>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="entregas">
            <MapPin className="w-4 h-4 mr-2" />
            Preços de Entrega
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Package className="w-4 h-4 mr-2" />
            Produtos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Preços de Entrega */}
        <TabsContent value="entregas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preços de Entrega por Cidade</CardTitle>
                  <CardDescription>
                    Configure os preços de frete entre cidades EUA-Brasil
                  </CardDescription>
                </div>
                <Dialog open={isEntregaDialogOpen} onOpenChange={setIsEntregaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Rota
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Preço de Entrega</DialogTitle>
                      <DialogDescription>
                        Configure o preço de frete entre uma origem e destino
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEntrega} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label className="text-base font-semibold">Origem (EUA)</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cidadeOrigem">Cidade *</Label>
                          <Input
                            id="cidadeOrigem"
                            placeholder="Ex: Miami"
                            value={formEntrega.cidadeOrigem}
                            onChange={(e) => setFormEntrega({ ...formEntrega, cidadeOrigem: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estadoOrigem">Estado *</Label>
                          <Select
                            value={formEntrega.estadoOrigem}
                            onValueChange={(value) => setFormEntrega({ ...formEntrega, estadoOrigem: value })}
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

                        <div className="space-y-2 col-span-2">
                          <Label className="text-base font-semibold">Destino (Brasil)</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cidadeDestino">Cidade *</Label>
                          <Input
                            id="cidadeDestino"
                            placeholder="Ex: São Paulo"
                            value={formEntrega.cidadeDestino}
                            onChange={(e) => setFormEntrega({ ...formEntrega, cidadeDestino: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estadoDestino">Estado *</Label>
                          <Select
                            value={formEntrega.estadoDestino}
                            onValueChange={(value) => setFormEntrega({ ...formEntrega, estadoDestino: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {estadosBrasil.map(estado => (
                                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label className="text-base font-semibold">Preços e Prazo</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="precoPorKg">Preço por Kg (USD) *</Label>
                          <Input
                            id="precoPorKg"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 8.50"
                            value={formEntrega.precoPorKg}
                            onChange={(e) => setFormEntrega({ ...formEntrega, precoPorKg: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="precoMinimo">Preço Mínimo (USD) *</Label>
                          <Input
                            id="precoMinimo"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 150.00"
                            value={formEntrega.precoMinimo}
                            onChange={(e) => setFormEntrega({ ...formEntrega, precoMinimo: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prazoEntrega">Prazo de Entrega (dias) *</Label>
                          <Input
                            id="prazoEntrega"
                            type="number"
                            placeholder="Ex: 30"
                            value={formEntrega.prazoEntrega}
                            onChange={(e) => setFormEntrega({ ...formEntrega, prazoEntrega: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2 flex items-center gap-2">
                          <Switch
                            id="ativoEntrega"
                            checked={formEntrega.ativo}
                            onCheckedChange={(checked) => setFormEntrega({ ...formEntrega, ativo: checked })}
                          />
                          <Label htmlFor="ativoEntrega">Rota Ativa</Label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsEntregaDialogOpen(false)}>
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
                    placeholder="Buscar por cidade ou estado..."
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
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Preço/Kg</TableHead>
                      <TableHead>Mínimo</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entregasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum preço de entrega cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      entregasFiltradas.map((entrega) => (
                        <TableRow key={entrega.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <div>
                                <div className="font-medium">{entrega.cidadeOrigem}</div>
                                <div className="text-xs text-muted-foreground">{entrega.estadoOrigem}, USA</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium">{entrega.cidadeDestino}</div>
                                <div className="text-xs text-muted-foreground">{entrega.estadoDestino}, Brasil</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">
                              ${entrega.precoPorKg.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              ${entrega.precoMinimo.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span>{entrega.prazoEntrega} dias</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={entrega.ativo ? 'default' : 'secondary'}>
                              {entrega.ativo ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEntrega(entrega);
                                  setFormEntrega({
                                    cidadeOrigem: entrega.cidadeOrigem,
                                    estadoOrigem: entrega.estadoOrigem,
                                    cidadeDestino: entrega.cidadeDestino,
                                    estadoDestino: entrega.estadoDestino,
                                    precoPorKg: entrega.precoPorKg.toString(),
                                    precoMinimo: entrega.precoMinimo.toString(),
                                    prazoEntrega: entrega.prazoEntrega.toString(),
                                    ativo: entrega.ativo,
                                  });
                                  setIsEditEntregaDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntrega(entrega.id)}
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

        {/* Tab: Produtos */}
        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tabela de Produtos</CardTitle>
                  <CardDescription>
                    Gerencie preços e estoque de caixas e fitas
                  </CardDescription>
                </div>
                <Dialog open={isProdutoDialogOpen} onOpenChange={setIsProdutoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F] hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Produto</DialogTitle>
                      <DialogDescription>
                        Cadastre um novo produto (caixa ou fita)
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitProduto} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tipo">Tipo *</Label>
                          <Select
                            value={formProduto.tipo}
                            onValueChange={(value: 'caixa' | 'fita') => setFormProduto({ ...formProduto, tipo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="caixa">Caixa</SelectItem>
                              <SelectItem value="fita">Fita Adesiva</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome do Produto *</Label>
                          <Input
                            id="nome"
                            placeholder="Ex: Caixa Grande"
                            value={formProduto.nome}
                            onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                            required
                          />
                        </div>
                        
                        {formProduto.tipo === 'caixa' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="tamanho">Tamanho</Label>
                              <Select
                                value={formProduto.tamanho}
                                onValueChange={(value) => setFormProduto({ ...formProduto, tamanho: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pequena">Pequena</SelectItem>
                                  <SelectItem value="Média">Média</SelectItem>
                                  <SelectItem value="Grande">Grande</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dimensoes">Dimensões</Label>
                              <Input
                                id="dimensoes"
                                placeholder="Ex: 40x30x25cm"
                                value={formProduto.dimensoes}
                                onChange={(e) => setFormProduto({ ...formProduto, dimensoes: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pesoMaximo">Peso Máximo (kg)</Label>
                              <Input
                                id="pesoMaximo"
                                type="number"
                                step="0.1"
                                placeholder="Ex: 30"
                                value={formProduto.pesoMaximo}
                                onChange={(e) => setFormProduto({ ...formProduto, pesoMaximo: e.target.value })}
                              />
                            </div>
                          </>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="unidade">Unidade *</Label>
                          <Select
                            value={formProduto.unidade}
                            onValueChange={(value) => setFormProduto({ ...formProduto, unidade: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unidade">Unidade</SelectItem>
                              <SelectItem value="rolo">Rolo</SelectItem>
                              <SelectItem value="pacote">Pacote</SelectItem>
                              <SelectItem value="caixa">Caixa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label className="text-base font-semibold">Preços</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="precoCusto">Preço de Custo (USD) *</Label>
                          <Input
                            id="precoCusto"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 5.00"
                            value={formProduto.precoCusto}
                            onChange={(e) => setFormProduto({ ...formProduto, precoCusto: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="precoVenda">Preço de Venda (USD) *</Label>
                          <Input
                            id="precoVenda"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 10.00"
                            value={formProduto.precoVenda}
                            onChange={(e) => setFormProduto({ ...formProduto, precoVenda: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label className="text-base font-semibold">Estoque</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estoque">Quantidade em Estoque *</Label>
                          <Input
                            id="estoque"
                            type="number"
                            placeholder="Ex: 100"
                            value={formProduto.estoque}
                            onChange={(e) => setFormProduto({ ...formProduto, estoque: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estoqueMinimo">Estoque Mínimo *</Label>
                          <Input
                            id="estoqueMinimo"
                            type="number"
                            placeholder="Ex: 20"
                            value={formProduto.estoqueMinimo}
                            onChange={(e) => setFormProduto({ ...formProduto, estoqueMinimo: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2 flex items-center gap-2">
                          <Switch
                            id="ativoProduto"
                            checked={formProduto.ativo}
                            onCheckedChange={(checked) => setFormProduto({ ...formProduto, ativo: checked })}
                          />
                          <Label htmlFor="ativoProduto">Produto Ativo</Label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsProdutoDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F]">
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
                    placeholder="Buscar produto..."
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
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Venda</TableHead>
                      <TableHead>Margem</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhum produto cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtosFiltrados.map((produto) => {
                        const estoqueAbaixo = produto.estoque <= produto.estoqueMinimo;
                        const margem = calcularMargem(produto.precoCusto, produto.precoVenda);
                        
                        return (
                          <TableRow key={produto.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {produto.tipo === 'caixa' ? (
                                  <Box className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Package className="w-5 h-5 text-orange-600" />
                                )}
                                <div>
                                  <div className="font-medium">{produto.nome}</div>
                                  {produto.tamanho && (
                                    <div className="text-xs text-muted-foreground">{produto.tamanho}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {produto.tipo === 'caixa' ? 'Caixa' : 'Fita'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                {produto.dimensoes && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Ruler className="w-3 h-3" />
                                    {produto.dimensoes}
                                  </div>
                                )}
                                {produto.pesoMaximo && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Weight className="w-3 h-3" />
                                    {produto.pesoMaximo}kg
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">
                                ${produto.precoCusto.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-700">
                                ${produto.precoVenda.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={parseFloat(margem) >= 50 ? 'default' : 'secondary'}
                                className={parseFloat(margem) >= 50 ? 'bg-green-600' : ''}
                              >
                                +{margem}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {estoqueAbaixo && (
                                  <AlertCircle className="w-4 h-4 text-orange-600" />
                                )}
                                <div>
                                  <div className={estoqueAbaixo ? 'text-orange-600 font-semibold' : ''}>
                                    {produto.estoque} {produto.unidade}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Mín: {produto.estoqueMinimo}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                                {produto.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduto(produto);
                                    setFormProduto({
                                      tipo: produto.tipo,
                                      nome: produto.nome,
                                      tamanho: produto.tamanho || '',
                                      dimensoes: produto.dimensoes || '',
                                      pesoMaximo: produto.pesoMaximo?.toString() || '',
                                      unidade: produto.unidade,
                                      precoCusto: produto.precoCusto.toString(),
                                      precoVenda: produto.precoVenda.toString(),
                                      estoque: produto.estoque.toString(),
                                      estoqueMinimo: produto.estoqueMinimo.toString(),
                                      ativo: produto.ativo,
                                    });
                                    setIsEditProdutoDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProduto(produto.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição de Entrega */}
      <Dialog open={isEditEntregaDialogOpen} onOpenChange={setIsEditEntregaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Preço de Entrega</DialogTitle>
            <DialogDescription>
              Atualize as informações do preço de frete
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEntrega} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-base font-semibold">Origem (EUA)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCidadeOrigem">Cidade *</Label>
                <Input
                  id="editCidadeOrigem"
                  placeholder="Ex: Miami"
                  value={formEntrega.cidadeOrigem}
                  onChange={(e) => setFormEntrega({ ...formEntrega, cidadeOrigem: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEstadoOrigem">Estado *</Label>
                <Select
                  value={formEntrega.estadoOrigem}
                  onValueChange={(value) => setFormEntrega({ ...formEntrega, estadoOrigem: value })}
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

              <div className="space-y-2 col-span-2">
                <Label className="text-base font-semibold">Destino (Brasil)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCidadeDestino">Cidade *</Label>
                <Input
                  id="editCidadeDestino"
                  placeholder="Ex: São Paulo"
                  value={formEntrega.cidadeDestino}
                  onChange={(e) => setFormEntrega({ ...formEntrega, cidadeDestino: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEstadoDestino">Estado *</Label>
                <Select
                  value={formEntrega.estadoDestino}
                  onValueChange={(value) => setFormEntrega({ ...formEntrega, estadoDestino: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosBrasil.map(estado => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-base font-semibold">Preços e Prazo</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrecoPorKg">Preço por Kg (USD) *</Label>
                <Input
                  id="editPrecoPorKg"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 8.50"
                  value={formEntrega.precoPorKg}
                  onChange={(e) => setFormEntrega({ ...formEntrega, precoPorKg: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrecoMinimo">Preço Mínimo (USD) *</Label>
                <Input
                  id="editPrecoMinimo"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  value={formEntrega.precoMinimo}
                  onChange={(e) => setFormEntrega({ ...formEntrega, precoMinimo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrazoEntrega">Prazo de Entrega (dias) *</Label>
                <Input
                  id="editPrazoEntrega"
                  type="number"
                  placeholder="Ex: 30"
                  value={formEntrega.prazoEntrega}
                  onChange={(e) => setFormEntrega({ ...formEntrega, prazoEntrega: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  id="editAtivoEntrega"
                  checked={formEntrega.ativo}
                  onCheckedChange={(checked) => setFormEntrega({ ...formEntrega, ativo: checked })}
                />
                <Label htmlFor="editAtivoEntrega">Rota Ativa</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditEntregaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Produto */}
      <Dialog open={isEditProdutoDialogOpen} onOpenChange={setIsEditProdutoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduto} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTipo">Tipo *</Label>
                <Select
                  value={formProduto.tipo}
                  onValueChange={(value: 'caixa' | 'fita') => setFormProduto({ ...formProduto, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="fita">Fita Adesiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNome">Nome do Produto *</Label>
                <Input
                  id="editNome"
                  placeholder="Ex: Caixa Grande"
                  value={formProduto.nome}
                  onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                  required
                />
              </div>
              
              {formProduto.tipo === 'caixa' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="editTamanho">Tamanho</Label>
                    <Select
                      value={formProduto.tamanho}
                      onValueChange={(value) => setFormProduto({ ...formProduto, tamanho: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pequena">Pequena</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDimensoes">Dimensões</Label>
                    <Input
                      id="editDimensoes"
                      placeholder="Ex: 40x30x25cm"
                      value={formProduto.dimensoes}
                      onChange={(e) => setFormProduto({ ...formProduto, dimensoes: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPesoMaximo">Peso Máximo (kg)</Label>
                    <Input
                      id="editPesoMaximo"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 30"
                      value={formProduto.pesoMaximo}
                      onChange={(e) => setFormProduto({ ...formProduto, pesoMaximo: e.target.value })}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="editUnidade">Unidade *</Label>
                <Select
                  value={formProduto.unidade}
                  onValueChange={(value) => setFormProduto({ ...formProduto, unidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="rolo">Rolo</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-base font-semibold">Preços</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrecoCusto">Preço de Custo (USD) *</Label>
                <Input
                  id="editPrecoCusto"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5.00"
                  value={formProduto.precoCusto}
                  onChange={(e) => setFormProduto({ ...formProduto, precoCusto: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrecoVenda">Preço de Venda (USD) *</Label>
                <Input
                  id="editPrecoVenda"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 10.00"
                  value={formProduto.precoVenda}
                  onChange={(e) => setFormProduto({ ...formProduto, precoVenda: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-base font-semibold">Estoque</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEstoque">Quantidade em Estoque *</Label>
                <Input
                  id="editEstoque"
                  type="number"
                  placeholder="Ex: 100"
                  value={formProduto.estoque}
                  onChange={(e) => setFormProduto({ ...formProduto, estoque: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEstoqueMinimo">Estoque Mínimo *</Label>
                <Input
                  id="editEstoqueMinimo"
                  type="number"
                  placeholder="Ex: 20"
                  value={formProduto.estoqueMinimo}
                  onChange={(e) => setFormProduto({ ...formProduto, estoqueMinimo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  id="editAtivoProduto"
                  checked={formProduto.ativo}
                  onCheckedChange={(checked) => setFormProduto({ ...formProduto, ativo: checked })}
                />
                <Label htmlFor="editAtivoProduto">Produto Ativo</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditProdutoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F]">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
