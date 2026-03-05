import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Search,
  User,
  MessageCircle,
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
import { stockService, productsService, userService } from "../services";
import { User as UserTypeDriver } from "../services/user.service";
import {
  EstoqueAtualizado,
  CriarMovimentacao,
} from "../services/stock.service";
import { PrecoProduto } from "../types";
import { ResponsavelSelect } from "./forms";
import { EmptyStateAlert } from "./EmptyStateAlert";

/** Chaves dos itens em inglês camelCase (payload: smallBoxes: 10) */
const ITEM_KEYS_EN = [
  "smallBoxes",
  "mediumBoxes",
  "largeBoxes",
  "personalizedItems",
  "adhesiveTape",
] as const;
type ItemKeyEn = (typeof ITEM_KEYS_EN)[number];

export interface EstoqueMovimentacao {
  id: string;
  type: "ENTRY" | "EXIT";
  productType:
  | "SMALL_BOX"
  | "MEDIUM_BOX"
  | "LARGE_BOX"
  | "PERSONALIZED_ITEM"
  | "TAPE_ADHESIVE";
  quantity: number;
  user: {
    id: string;
    name: string;
    role: "DRIVER";
  };
  observations?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    type: string;
  };
}

export const ITEM_LABELS: Record<ItemKeyEn, string> = {
  smallBoxes: "Caixas Pequenas",
  mediumBoxes: "Caixas Médias",
  largeBoxes: "Caixas Grandes",
  personalizedItems: "Itens Personalizados",
  adhesiveTape: "Fitas Adesivas",
};

export type ProductType =
  | "SMALL_BOX"
  | "MEDIUM_BOX"
  | "LARGE_BOX"
  | "PERSONALIZED_ITEM"
  | "TAPE_ADHESIVE";

/** Backend productType (enum) → chave do frontend (camelCase) */
export const PRODUCT_TYPE_TO_ITEM_KEY: Record<ProductType, ItemKeyEn> = {
  SMALL_BOX: "smallBoxes",
  MEDIUM_BOX: "mediumBoxes",
  LARGE_BOX: "largeBoxes",
  PERSONALIZED_ITEM: "personalizedItems",
  TAPE_ADHESIVE: "adhesiveTape",
};

/** Chave do frontend (camelCase) → backend productType (enum) */
const ITEM_KEY_TO_PRODUCT_TYPE: Record<ItemKeyEn, ProductType> = {
  smallBoxes: "SMALL_BOX",
  mediumBoxes: "MEDIUM_BOX",
  largeBoxes: "LARGE_BOX",
  personalizedItems: "PERSONALIZED_ITEM",
  adhesiveTape: "TAPE_ADHESIVE",
};

function getMovItemKey(mov: EstoqueMovimentacao): ItemKeyEn | undefined {
  return PRODUCT_TYPE_TO_ITEM_KEY[mov.product.type as ProductType];
}

function getMovQuantity(mov: EstoqueMovimentacao): number {
  return mov.quantity ?? 0;
}

function normalizeField(value: string) {
  if (!value) return "";
  return (
    value
      .charAt(0)
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
      .toUpperCase() + value.slice(1).replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
  );
}

const ESTOQUE_MINIMO = {
  smallBoxes: 50,
  mediumBoxes: 50,
  largeBoxes: 50,
  personalizedItems: 20,
  adhesiveTape: 20,
};

const ESTOQUE_IDEAL = {
  smallBoxes: 100,
  mediumBoxes: 100,
  largeBoxes: 100,
  personalizedItems: 100,
  adhesiveTape: 100,
};

export default function EstoqueView() {
  const [searchTerm, setSearchTerm] = useState("");
  const { estoque, updateEstoque } = useData();
  const [movimentacoes, setMovimentacoes] = useState<EstoqueMovimentacao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"ENTRY" | "EXIT">("ENTRY");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantidade, setQuantidade] = useState(0);
  const [responsavel, setResponsavel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [idStock, setIdStock] = useState<string | null>(null);
  const stockIdRef = useRef<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [movimentacoesPage, setMovimentacoesPage] = useState(1);
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [motoristas, setMotoristas] = useState<UserTypeDriver[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<string>("");

  const MOVIMENTACOES_PAGE_SIZE = 10;

  /** Filtra movimentações por termo de busca (tipo, data, responsável, observações, produto, quantidade) */
  const movimentacoesFiltradas = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...movimentacoes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    const term = searchTerm.trim().toLowerCase();
    const typeStr = (t: string) => (t === "ENTRY" ? "entrada" : "saída");
    const labelOf = (mov: EstoqueMovimentacao) =>
      ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[mov.productType as ProductType]] ??
      "";
    const dateStr = (d: string) =>
      new Date(d).toLocaleDateString("pt-BR") +
      " " +
      new Date(d).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return [...movimentacoes]
      .filter((mov) => {
        const productType =
          ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[mov.product.type]];
        const type = typeStr(mov.type);
        const label = labelOf(mov);
        const date = dateStr(mov.createdAt);
        const qty = String(mov.quantity);
        const resp = (mov.user.name ?? "").toLowerCase();
        const obs = (mov.observations ?? "").toLowerCase();
        const product = (mov.product.name ?? "").toLowerCase();

        return (
          productType.toLowerCase().includes(term) ||
          type.includes(term) ||
          label.toLowerCase().includes(term) ||
          date.toLowerCase().includes(term) ||
          qty.includes(term) ||
          resp.includes(term) ||
          obs.includes(term) ||
          product.includes(term)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [movimentacoes, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(movimentacoesFiltradas.length / MOVIMENTACOES_PAGE_SIZE),
  );
  const movimentacoesPaginas = useMemo(() => {
    const start = (movimentacoesPage - 1) * MOVIMENTACOES_PAGE_SIZE;
    return movimentacoesFiltradas.slice(start, start + MOVIMENTACOES_PAGE_SIZE);
  }, [movimentacoesFiltradas, movimentacoesPage]);

  useEffect(() => {
    setMovimentacoesPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (movimentacoesPage > totalPages) {
      setMovimentacoesPage(totalPages);
    }
  }, [totalPages, movimentacoesPage]);

  useEffect(() => {
    const carregarEstoque = async () => {
      const result = await stockService.getAll();
      if (result.success && result.data?.data?.length) {
        const stock = result.data.data[0];
        updateEstoque({
          smallBoxes: stock.smallBoxes ?? 0,
          mediumBoxes: stock.mediumBoxes ?? 0,
          largeBoxes: stock.largeBoxes ?? 0,
          personalizedItems: stock.personalizedItems ?? 0,
          adhesiveTape: stock.adhesiveTape ?? 0,
        });
        stockIdRef.current = stock.id ?? null;

        if (stock.stockMovements?.length) {
          setMovimentacoes(stock.stockMovements);
        }
      } else if (result.error) {
        toast.error(result.error);
      }
    };

    carregarEstoque();
  }, []);

  const carregarProdutos = async () => {
    const result = await productsService.getAll();
    if (result.success && result.data) {
      setProdutos(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const carregarMotoristas = async () => {
    const result = await userService.buscarTodosMotoristas();
    if (result.success && result.data) {
      setMotoristas(result.data.data);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleMovimentacao = async () => {
    if (!selectedItem || quantidade <= 0 || !responsavel || !selectedProduto) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const itemKey = selectedItem as keyof typeof estoque;

    if (dialogType === "EXIT" && estoque[itemKey] < quantidade) {
      toast.error("Estoque insuficiente");
      return;
    }

    // Atualizar estoque
    const novoValor =
      dialogType === "ENTRY"
        ? estoque[itemKey] + quantidade
        : estoque[itemKey] - quantidade;

    updateEstoque({
      [itemKey]: novoValor,
    });

    // Payload: productType no formato do backend (SMALL_BOX, etc.)
    const itemProductType = ITEM_KEY_TO_PRODUCT_TYPE[selectedItem];
    if (!itemProductType) return;

    if (!idStock) {
      toast.error("Estoque não carregado");
      return;
    }

    const atualizarEstoque: EstoqueAtualizado = {
      [selectedItem]: quantidade,
    };

    const movimentacaoPayload: CriarMovimentacao = {
      type: dialogType,
      productType: itemProductType,
      quantity: quantidade,
      userId: responsavel,
      observations: observacao,
      productId: selectedProduto,
    };

    const result = await stockService.update(
      idStock,
      atualizarEstoque,
      movimentacaoPayload,
      dialogType,
    );

    if (!result.success) {
      toast.error(result.error || "Erro ao atualizar estoque");
      return;
    }

    if (result.data?.stockMovements) {
      setMovimentacoes(result.data.stockMovements);
    }

    toast.success(
      dialogType === "ENTRY"
        ? "Entrada registrada com sucesso!"
        : "Saída registrada com sucesso!",
    );

    // Reset form
    setSelectedItem("");
    setSelectedProduto("");
    setQuantidade(0);
    setResponsavel("");
    setObservacao("");
    setIsDialogOpen(false);
  };

  const itensEstoque = [
    {
      key: "smallBoxes" as const,
      nome: "Caixas Pequenas",
      cor: "red",
      icon: Package,
      minimo: ESTOQUE_MINIMO.smallBoxes,
      ideal: ESTOQUE_IDEAL.smallBoxes,
    },
    {
      key: "mediumBoxes" as const,
      nome: "Caixas Médias",
      cor: "green",
      icon: Package,
      minimo: ESTOQUE_MINIMO.mediumBoxes,
      ideal: ESTOQUE_IDEAL.mediumBoxes,
    },
    {
      key: "largeBoxes" as const,
      nome: "Caixas Grandes",
      cor: "orange",
      icon: Package,
      minimo: ESTOQUE_MINIMO.largeBoxes,
      ideal: ESTOQUE_IDEAL.largeBoxes,
    },
    {
      key: "personalizedItems" as const,
      nome: "Itens Personalizados",
      cor: "purple",
      icon: Package,
      minimo: ESTOQUE_MINIMO.personalizedItems,
      ideal: ESTOQUE_IDEAL.personalizedItems,
    },
    {
      key: "adhesiveTape" as const,
      nome: "Fitas Adesivas",
      cor: "blue",
      icon: Archive,
      minimo: ESTOQUE_MINIMO.adhesiveTape,
      ideal: ESTOQUE_IDEAL.adhesiveTape,
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
          m.type === "ENTRY" &&
          Date.now() - new Date(m.createdAt).getTime() <
          7 * 24 * 60 * 60 * 1000,
      )
      .reduce((sum, m) => sum + getMovQuantity(m), 0);

    const saidas7dias = movimentacoes
      .filter(
        (m) =>
          m.type === "EXIT" &&
          Date.now() - new Date(m.createdAt).getTime() <
          7 * 24 * 60 * 60 * 1000,
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
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (open) {
                  carregarProdutos();
                  carregarMotoristas();
                  setIdStock(stockIdRef.current);
                } else {
                  setSelectedProduto("");
                  setIdStock(null);
                  setSelectedItem("");
                  setQuantidade(0);
                  setResponsavel("");
                  setObservacao("");
                  setProdutos([]);
                  setMotoristas([]);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setDialogType("ENTRY")}>
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
                      variant={dialogType === "ENTRY" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDialogType("ENTRY")}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Entrada
                    </Button>
                    <Button
                      variant={dialogType === "EXIT" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setDialogType("EXIT")}
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Saída
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <select
                      required
                      value={selectedItem}
                      onChange={(e) => {
                        setSelectedItem(e.target.value);
                        setSelectedProduto("");
                      }}
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

                  {/* Mensagem de erro caso não tenha itens para a categoria selecionada seja ativa */}
                  {selectedItem &&
                    !produtos.filter(
                      (produto) =>
                        produto.active === true &&
                        produto.type === ITEM_KEY_TO_PRODUCT_TYPE[selectedItem],
                    ).length && (
                      <EmptyStateAlert
                        title="Nenhum item encontrado para a categoria"
                        description="Não há itens ativos para a categoria selecionada. Cadastre um item ou ative um existente. O campo Item do Estoque ficará desabilitado até que exista ao menos um item ativo para a categoria selecionada."
                      />
                    )}

                  {/* Adicionar item do estoque */}
                  {selectedItem && (
                    <div className="space-y-2">
                      <Label>Item do Estoque *</Label>
                      <select
                        required
                        disabled={
                          !selectedItem ||
                          !produtos.filter(
                            (produto) =>
                              produto.active === true &&
                              produto.type ===
                              ITEM_KEY_TO_PRODUCT_TYPE[selectedItem],
                          ).length
                        } // Tirar disabled caso precise
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        value={selectedProduto || ""}
                        onChange={(e) => setSelectedProduto(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {produtos
                          .filter(
                            (produto) =>
                              produto.type ===
                              ITEM_KEY_TO_PRODUCT_TYPE[selectedItem] &&
                              produto.active === true,
                          )
                          .map((produto) => (
                            <option key={produto.id} value={produto.id}>
                              {produto.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

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

                  <ResponsavelSelect
                    label="Responsável *"
                    items={motoristas}
                    value={responsavel}
                    onValueChange={setResponsavel}
                    placeholder="Selecione o responsável..."
                    searchPlaceholder="Buscar responsável..."
                    emptyMessage="Nenhum responsável encontrado."
                  />

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
                      Registrar {dialogType === "ENTRY" ? "Entrada" : "Saída"}
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
                className={`hover:shadow-lg transition-all border-l-4 ${item.cor === "red"
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
                    className={`h-5 w-5 ${item.cor === "red"
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
                          className={`h-2 rounded-full transition-all ${item.cor === "red"
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
                          setDialogType("ENTRY");
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
                {searchTerm.trim()
                  ? `${movimentacoesFiltradas.length} de ${movimentacoes.length} movimentações`
                  : `Últimas ${movimentacoes.length} movimentações registradas`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowFilters(!showFilters);
                setSearchTerm("");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Painel de Filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="space-y-4 pt-0 pb-6">
                  <div className="space-y-2">
                    <Label>Filtrar movimentações</Label>

                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por tipo, data, responsável, etc..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <AnimatePresence>
              {movimentacoesPaginas.map((mov) => {
                const itemKey = getMovItemKey(mov);
                const qty = getMovQuantity(mov);
                return (
                  <motion.div
                    key={mov.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-lg border-l-4 ${mov.type === "ENTRY"
                        ? "bg-green-50 border-green-500"
                        : "bg-orange-50 border-orange-500"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2 rounded-full ${mov.type === "ENTRY"
                              ? "bg-green-100"
                              : "bg-orange-100"
                            }`}
                        >
                          {mov.type === "ENTRY" ? (
                            <ArrowUpRight
                              className={`w-4 h-4 ${mov.type === "ENTRY"
                                  ? "text-green-600"
                                  : "text-orange-600"
                                }`}
                            />
                          ) : (
                            <ArrowDownRight
                              className={`w-4 h-4 ${mov.type === "EXIT"
                                  ? "text-orange-600"
                                  : "text-green-600"
                                }`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {itemKey ? ITEM_LABELS[itemKey] : "-"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Produto: {mov.product.name}
                            </span>
                            <Badge
                              className={
                                mov.type === "ENTRY"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }
                            >
                              {mov.type === "ENTRY" ? "Entrada" : "Saída"}
                            </Badge>
                            <span
                              className={`font-bold ${mov.type === "ENTRY"
                                  ? "text-green-600"
                                  : "text-orange-600"
                                }`}
                            >
                              {mov.type === "ENTRY" ? "+" : "-"}
                              {qty}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(mov.createdAt).toLocaleDateString(
                                  "pt-BR",
                                )}{" "}
                                às{" "}
                                {new Date(mov.createdAt).toLocaleTimeString(
                                  "pt-BR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{mov.user.name}</span>
                            </div>
                          </div>
                          {mov.observations && (
                            <p className="text-sm text-muted-foreground italic mt-1 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {":"} {mov.observations}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Paginação */}
            {movimentacoesFiltradas.length > MOVIMENTACOES_PAGE_SIZE && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {movimentacoesPage} de {totalPages} (
                  {(movimentacoesPage - 1) * MOVIMENTACOES_PAGE_SIZE + 1}–
                  {Math.min(
                    movimentacoesPage * MOVIMENTACOES_PAGE_SIZE,
                    movimentacoesFiltradas.length,
                  )}{" "}
                  de {movimentacoesFiltradas.length})
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMovimentacoesPage((p) => Math.max(1, p - 1))
                    }
                    disabled={movimentacoesPage <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMovimentacoesPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={movimentacoesPage >= totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}

            {movimentacoes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
            {movimentacoes.length > 0 &&
              movimentacoesFiltradas.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Nenhuma movimentação encontrada para &quot;{searchTerm}
                    &quot;
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
