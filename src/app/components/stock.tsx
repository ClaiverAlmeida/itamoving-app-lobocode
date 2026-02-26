import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useData } from "../context/DataContext";
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Archive,
  ShoppingCart,
  BarChart3,
  Download,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/** Chaves dos itens em inglês camelCase (payload: smallBoxes: 10) */
const ITEM_KEYS_EN = [
  "smallBoxes",
  "mediumBoxes",
  "largeBoxes",
  "tapes",
  "caixasPersonalizadas",
] as const;
type ItemKeyEn = (typeof ITEM_KEYS_EN)[number];

interface Movimentacao {
  id?: string;
  tipo: "entrada" | "saida";
  data: Date;
  responsavel: string;
  observacao?: string;
  /** Tipo do item em inglês camelCase → quantidade (ex.: smallBoxes: 10) */
  smallBoxes?: number;
  mediumBoxes?: number;
  largeBoxes?: number;
  caixasPersonalizadas?: number;
  tapes?: number;
}

const ITEM_LABELS: Record<ItemKeyEn, string> = {
  smallBoxes: "Caixas Pequenas",
  mediumBoxes: "Caixas Médias",
  largeBoxes: "Caixas Grandes",
  caixasPersonalizadas: "Caixas Personalizadas",
  tapes: "Fitas Adesivas",
};

/** Mapa do selectedItem (chave do Estoque no context) → chave em inglês para o payload */
const ITEM_PT_TO_EN: Record<string, ItemKeyEn> = {
  caixasPequenas: "smallBoxes",
  caixasMedias: "mediumBoxes",
  caixasGrandes: "largeBoxes",
  caixasPersonalizadas: "caixasPersonalizadas",
  fitasAdesivas: "tapes",
};

function getMovItemKey(mov: Movimentacao): ItemKeyEn | undefined {
  for (const k of ITEM_KEYS_EN) {
    if (mov[k] != null && typeof mov[k] === "number") return k;
  }
  return undefined;
}

function getMovQuantity(mov: Movimentacao): number {
  const key = getMovItemKey(mov);
  return key != null ? (mov[key] ?? 0) : 0;
}

const ESTOQUE_MINIMO = {
  caixasPequenas: 50,
  caixasMedias: 30,
  caixasGrandes: 20,
  caixasPersonalizadas: 10,
  fitasAdesivas: 40,
};

const ESTOQUE_IDEAL = {
  caixasPequenas: 200,
  caixasMedias: 150,
  caixasGrandes: 100,
  caixasPersonalizadas: 50,
  fitasAdesivas: 150,
};

export default function EstoqueView() {
  const { estoque, updateEstoque } = useData();
  const [quantidades, setQuantidades] = useState({
    caixasPequenas: 0,
    caixasMedias: 0,
    caixasGrandes: 0,
    caixasPersonalizadas: 0,
    fitasAdesivas: 0,
  });

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([
    {
      id: "1",
      tipo: "entrada",
      smallBoxes: 100,
      data: new Date("2024-12-20T10:30:00"),
      responsavel: "João Silva",
      observacao: "Compra mensal",
    },
    {
      id: "2",
      tipo: "saida",
      mediumBoxes: 25,
      data: new Date("2024-12-21T14:20:00"),
      responsavel: "Maria Costa",
      observacao: "Cliente Ana Oliveira",
    },
    {
      id: "3",
      tipo: "entrada",
      tapes: 50,
      data: new Date("2024-12-21T16:45:00"),
      responsavel: "Pedro Santos",
    },
    {
      id: "4",
      tipo: "saida",
      largeBoxes: 15,
      data: new Date("2024-12-22T09:15:00"),
      responsavel: "João Silva",
      observacao: "Container #12345",
    },
    {
      id: "5",
      tipo: "entrada",
      caixasPersonalizadas: 10,
      data: new Date("2024-12-22T09:15:00"),
      responsavel: "Administrador",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"entrada" | "saida">("entrada");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantidade, setQuantidade] = useState(0);
  const [responsavel, setResponsavel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleMovimentacao = () => {
    if (!selectedItem || quantidade <= 0 || !responsavel) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const itemKey = selectedItem as keyof typeof estoque;

    if (dialogType === "saida" && estoque[itemKey] < quantidade) {
      toast.error("Estoque insuficiente");
      return;
    }

    // Atualizar estoque
    const novoValor =
      dialogType === "entrada"
        ? estoque[itemKey] + quantidade
        : estoque[itemKey] - quantidade;

    updateEstoque({
      [itemKey]: novoValor,
    });

    // Payload: chave = tipo do item em inglês camelCase, valor = quantidade (ex.: smallBoxes: 10)
    const itemKeyEn = ITEM_PT_TO_EN[selectedItem];
    if (!itemKeyEn) return;
    const novaMovimentacao: Movimentacao = {
      tipo: dialogType,
      [itemKeyEn]: quantidade,
      data: new Date(),
      responsavel,
      observacao,
    };

    console.log("novaMovimentacao", novaMovimentacao);
    setMovimentacoes([novaMovimentacao, ...movimentacoes]);

    toast.success(
      dialogType === "entrada"
        ? "Entrada registrada com sucesso!"
        : "Saída registrada com sucesso!",
    );

    // Reset form
    setSelectedItem("");
    setQuantidade(0);
    setResponsavel("");
    setObservacao("");
    setIsDialogOpen(false);
  };

  const itensEstoque = [
    {
      key: "caixasPequenas" as const,
      nome: "Caixas Pequenas",
      cor: "red",
      icon: Package,
      minimo: ESTOQUE_MINIMO.caixasPequenas,
      ideal: ESTOQUE_IDEAL.caixasPequenas,
    },
    {
      key: "caixasMedias" as const,
      nome: "Caixas Médias",
      cor: "green",
      icon: Package,
      minimo: ESTOQUE_MINIMO.caixasMedias,
      ideal: ESTOQUE_IDEAL.caixasMedias,
    },
    {
      key: "caixasGrandes" as const,
      nome: "Caixas Grandes",
      cor: "orange",
      icon: Package,
      minimo: ESTOQUE_MINIMO.caixasGrandes,
      ideal: ESTOQUE_IDEAL.caixasGrandes,
    },
    {
      key: "caixasPersonalizadas" as const,
      nome: "Caixas Personalizadas",
      cor: "purple",
      icon: Package,
      minimo: ESTOQUE_MINIMO.caixasPersonalizadas,
      ideal: ESTOQUE_IDEAL.caixasPersonalizadas,
    },
    {
      key: "fitasAdesivas" as const,
      nome: "Fitas Adesivas",
      cor: "blue",
      icon: Archive,
      minimo: ESTOQUE_MINIMO.fitasAdesivas,
      ideal: ESTOQUE_IDEAL.fitasAdesivas,
    },
  ];

  const getNivelEstoque = (
    quantidade: number,
    minimo: number,
    ideal: number,
  ) => {
    if (quantidade < minimo)
      return { nivel: "critico", label: "Crítico", color: "red" };
    if (quantidade < minimo * 1.5)
      return { nivel: "baixo", label: "Baixo", color: "yellow" };
    if (quantidade < ideal)
      return { nivel: "medio", label: "Médio", color: "blue" };
    return { nivel: "ideal", label: "Ideal", color: "green" };
  };

  const statistics = useMemo(() => {
    const totalItens = Object.values(estoque).reduce(
      (sum, val) => sum + val,
      0,
    );
    const itensCriticos = itensEstoque.filter(
      (item) => estoque[item.key] < item.minimo,
    ).length;
    const itensOk = itensEstoque.filter(
      (item) => estoque[item.key] >= item.ideal,
    ).length;

    const entradas7dias = movimentacoes
      .filter(
        (m) =>
          m.tipo === "entrada" &&
          Date.now() - m.data.getTime() < 7 * 24 * 60 * 60 * 1000,
      )
      .reduce((sum, m) => sum + getMovQuantity(m), 0);

    const saidas7dias = movimentacoes
      .filter(
        (m) =>
          m.tipo === "saida" &&
          Date.now() - m.data.getTime() < 7 * 24 * 60 * 60 * 1000,
      )
      .reduce((sum, m) => sum + getMovQuantity(m), 0);

    return { totalItens, itensCriticos, itensOk, entradas7dias, saidas7dias };
  }, [estoque, movimentacoes, itensEstoque]);

  const chartData = itensEstoque.map((item) => ({
    nome: item.nome.replace("Caixas ", "").replace("Fitas Adesivas", "Fitas"),
    atual: estoque[item.key],
    minimo: item.minimo,
    ideal: item.ideal,
    fill:
      item.cor === "red"
        ? "#EF4444"
        : item.cor === "green"
          ? "#10B981"
          : item.cor === "orange"
            ? "#F59E0B"
            : item.cor === "purple"
              ? "#A855F7"
              : "#5DADE2",
  }));

  const distribuicaoData = itensEstoque.map((item) => ({
    name: item.nome.replace("Caixas ", "").replace("Fitas Adesivas", "Fitas"),
    value: estoque[item.key],
    color:
      item.cor === "blue"
        ? "#5DADE2"
        : item.cor === "green"
          ? "#10B981"
          : item.cor === "purple"
            ? "#A855F7"
            : item.cor === "orange"
              ? "#F59E0B"
              : item.cor === "red"
                ? "#EF4444"
                : "#5DADE2",
  }));

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Controle de Estoque
            </h2>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Gerencie caixas, materiais e movimentações
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setDialogType("entrada")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Movimentação</DialogTitle>
                  <DialogDescription>
                    Adicione ou remova itens do estoque
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={dialogType === "entrada" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDialogType("entrada")}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Entrada
                    </Button>
                    <Button
                      variant={dialogType === "saida" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDialogType("saida")}
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Saída
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Item *</Label>
                    <select
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">Selecione...</option>
                      {itensEstoque.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantidade || ""}
                      onChange={(e) =>
                        setQuantidade(parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Responsável *</Label>
                    <Input
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Observação</Label>
                    <Textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      placeholder="Informações adicionais..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleMovimentacao}>
                      Registrar {dialogType === "entrada" ? "Entrada" : "Saída"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          <Card className="p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-blue-900">
                Total de Itens
              </span>
              <Boxes className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-900">
              {statistics.totalItens}
            </p>
            <p className="text-xs text-blue-700 mt-1">Unidades em estoque</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-red-900">
                Críticos
              </span>
              <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-red-900">
              {statistics.itensCriticos}
            </p>
            <p className="text-xs text-red-700 mt-1">Abaixo do mínimo</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-green-900">
                Ideais
              </span>
              <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-green-900">
              {statistics.itensOk}
            </p>
            <p className="text-xs text-green-700 mt-1">Estoque adequado</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-purple-900">
                Entradas (7d)
              </span>
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-purple-900">
              {statistics.entradas7dias}
            </p>
            <p className="text-xs text-purple-700 mt-1">Última semana</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-orange-900">
                Saídas (7d)
              </span>
              <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-orange-900">
              {statistics.saidas7dias}
            </p>
            <p className="text-xs text-orange-700 mt-1">Última semana</p>
          </Card>
        </div>
      </div>

      {/* Cards de Estoque */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {itensEstoque.map((item) => {
          const quantidade = estoque[item.key];
          const nivel = getNivelEstoque(quantidade, item.minimo, item.ideal);
          const percentual = (quantidade / item.ideal) * 100;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`hover:shadow-lg transition-all border-l-4 ${
                  item.cor === "red"
                    ? "border-red-500 bg-red-50"
                    : item.cor === "green"
                      ? "border-green-500 bg-green-50"
                      : item.cor === "orange"
                        ? "border-orange-500 bg-orange-50"
                        : item.cor === "purple"
                          ? "border-purple-500 bg-purple-50"
                          : "border-blue-500 bg-blue-50"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.nome}
                  </CardTitle>
                  <Icon
                    className={`h-5 w-5 ${
                      item.cor === "red"
                        ? "text-red-600"
                        : item.cor === "green"
                          ? "text-green-600"
                          : item.cor === "orange"
                            ? "text-orange-600"
                            : item.cor === "purple"
                              ? "text-purple-600"
                              : "text-blue-600"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold">{quantidade}</div>
                      <Badge
                        className={
                          nivel.color === "red"
                            ? "bg-red-100 text-red-700"
                            : nivel.color === "yellow"
                              ? "bg-yellow-100 text-yellow-700"
                              : nivel.color === "blue"
                                ? "bg-blue-100 text-blue-700"
                                : nivel.color === "purple"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-green-100 text-green-700"
                        }
                      >
                        {nivel.label}
                      </Badge>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mín: {item.minimo}</span>
                        <span>Ideal: {item.ideal}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.cor === "red"
                              ? "bg-red-500"
                              : item.cor === "green"
                                ? "bg-green-500"
                                : item.cor === "orange"
                                  ? "bg-orange-500"
                                  : item.cor === "purple"
                                    ? "bg-purple-500"
                                    : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {percentual.toFixed(0)}% do ideal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Níveis */}
        <Card>
          <CardHeader>
            <CardTitle>Níveis de Estoque</CardTitle>
            <CardDescription>
              Comparativo com estoque mínimo e ideal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="nome" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="atual" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-atual-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <Bar dataKey="minimo" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="ideal" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Estoque</CardTitle>
            <CardDescription>Proporção de itens por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {statistics.itensCriticos > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-900">Alertas Críticos</CardTitle>
              </div>
              <CardDescription className="text-red-700">
                Itens que necessitam reposição urgente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itensEstoque.map((item) => {
                  const quantidade = estoque[item.key];
                  const nivel = getNivelEstoque(
                    quantidade,
                    item.minimo,
                    item.ideal,
                  );

                  if (nivel.nivel !== "critico") return null;

                  const faltam = item.ideal - quantidade;

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100">
                          <item.icon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-900">
                            {item.nome}
                          </p>
                          <p className="text-sm text-red-700">
                            Estoque: {quantidade} | Mínimo: {item.minimo} |
                            Faltam: {faltam}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setDialogType("entrada");
                          setSelectedItem(item.key);
                          setIsDialogOpen(true);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Repor
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Últimas {movimentacoes.length} movimentações registradas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {movimentacoes.map((mov) => {
                const itemKey = getMovItemKey(mov);
                const qty = getMovQuantity(mov);
                return (
                  <motion.div
                    key={mov.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      mov.tipo === "entrada"
                        ? "bg-green-50 border-green-500"
                        : "bg-orange-50 border-orange-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2 rounded-full ${
                            mov.tipo === "entrada"
                              ? "bg-green-100"
                              : "bg-orange-100"
                          }`}
                        >
                          {mov.tipo === "entrada" ? (
                            <ArrowUpRight
                              className={`w-4 h-4 ${
                                mov.tipo === "entrada"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            />
                          ) : (
                            <ArrowDownRight
                              className={`w-4 h-4 ${
                                mov.tipo === "entrada"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {itemKey ? ITEM_LABELS[itemKey] : "-"}
                            </span>
                            <Badge
                              className={
                                mov.tipo === "entrada"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }
                            >
                              {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                            </Badge>
                            <span
                              className={`font-bold ${
                                mov.tipo === "entrada"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {mov.tipo === "entrada" ? "+" : "-"}
                              {qty}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {mov.data.toLocaleDateString("pt-BR")} às{" "}
                                {mov.data.toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>{mov.responsavel}</span>
                            </div>
                          </div>
                          {mov.observacao && (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              Obs: {mov.observacao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {movimentacoes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
