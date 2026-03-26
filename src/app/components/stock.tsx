import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { DriverUser, PrecoProduto } from "../api";
import { useData } from "../context/DataContext";
import { Button } from "./ui/button";
import {
  MOVIMENTACOES_PAGE_SIZE,
  STOCK_ITEMS,
  StockCharts,
  StockCriticalAlerts,
  StockItemsGrid,
  StockMetricsCards,
  StockMovementDialog,
  StockMovementsHistory,
  buildStatistics,
  buildStockChartsData,
  filterMovimentacoes,
  handleStockMovement,
  stockCrud,
  type EstoqueMovimentacao,
  type ItemKeyEn,
  type MovementDialogType,
} from "./stock/index";

type StockMap = Record<string, number>;

export default function EstoqueView() {
  const { estoque, updateEstoque } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [movimentacoes, setMovimentacoes] = useState<EstoqueMovimentacao[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [movimentacoesPage, setMovimentacoesPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<MovementDialogType>("ENTRY");
  const [selectedItem, setSelectedItem] = useState<ItemKeyEn | "">("");
  const [selectedProduto, setSelectedProduto] = useState("");
  const [quantidade, setQuantidade] = useState(0);
  const [responsavel, setResponsavel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [idStock, setIdStock] = useState<string | null>(null);
  const stockIdRef = useRef<string | null>(null);
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [motoristas, setMotoristas] = useState<DriverUser[]>([]);

  const resetDialogForm = () => {
    setSelectedItem("");
    setSelectedProduto("");
    setQuantidade(0);
    setResponsavel("");
    setObservacao("");
  };

  const carregarEstoque = async () => {
    const result = await stockCrud.getAll();
    if (result.success && result.data?.length) {
      const stock = result.data[0];
      updateEstoque({
        smallBoxes: stock.smallBoxes ?? 0,
        mediumBoxes: stock.mediumBoxes ?? 0,
        largeBoxes: stock.largeBoxes ?? 0,
        personalizedItems: stock.personalizedItems ?? 0,
        adhesiveTape: stock.adhesiveTape ?? 0,
      });
      stockIdRef.current = stock.id ?? null;
      if (stock.stockMovements?.length) setMovimentacoes(stock.stockMovements);
      return;
    }
    if (result.error) toast.error(result.error);
  };

  const carregarProdutos = async () => {
    const result = await stockCrud.getProducts();
    if (result.success && result.data) setProdutos(result.data);
    else if (result.error) toast.error(result.error);
  };

  const carregarMotoristas = async () => {
    const result = await stockCrud.getDrivers();
    if (result.success && result.data) setMotoristas(result.data);
    else if (result.error) toast.error(result.error);
  };

  useEffect(() => {
    void carregarEstoque();
  }, []);

  const movimentacoesFiltradas = useMemo(
    () => filterMovimentacoes(movimentacoes, searchTerm),
    [movimentacoes, searchTerm],
  );

  const totalPages = Math.max(1, Math.ceil(movimentacoesFiltradas.length / MOVIMENTACOES_PAGE_SIZE));
  const movimentacoesPaginas = useMemo(() => {
    const start = (movimentacoesPage - 1) * MOVIMENTACOES_PAGE_SIZE;
    return movimentacoesFiltradas.slice(start, start + MOVIMENTACOES_PAGE_SIZE);
  }, [movimentacoesFiltradas, movimentacoesPage]);

  useEffect(() => {
    setMovimentacoesPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (movimentacoesPage > totalPages) setMovimentacoesPage(totalPages);
  }, [movimentacoesPage, totalPages]);

  const statistics = useMemo(
    () => buildStatistics(estoque as StockMap, STOCK_ITEMS, movimentacoes),
    [estoque, movimentacoes],
  );

  const { chartData, distribuicaoData } = useMemo(
    () => buildStockChartsData(STOCK_ITEMS, estoque as StockMap),
    [estoque],
  );

  const onOpenDialogChange = async (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      await Promise.all([carregarProdutos(), carregarMotoristas()]);
      setIdStock(stockIdRef.current);
      return;
    }
    setIdStock(null);
    setProdutos([]);
    setMotoristas([]);
    resetDialogForm();
  };

  const onSubmitMovimentacao = async () => {
    await handleStockMovement({
      selectedItem,
      quantidade,
      responsavel,
      selectedProduto,
      observacao,
      dialogType,
      estoqueAtual: estoque as StockMap,
      idStock,
      updateEstoque: (data) => updateEstoque(data),
      updateStockRemote: (stockId, payload, movementPayload, type) =>
        stockCrud.update(stockId, payload, movementPayload, type),
      setMovimentacoes,
      onError: (message) => toast.error(message),
      onSuccess: () => {
        toast.success(dialogType === "ENTRY" ? "Entrada registrada com sucesso!" : "Saída registrada com sucesso!");
        resetDialogForm();
    setIsDialogOpen(false);
      },
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">Controle de Estoque</h2>
            <p className="mt-1 text-sm text-muted-foreground lg:text-base">Gerencie caixas, materiais e movimentações</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button variant="outline" size="sm" className="w-full flex-1 sm:w-auto sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <StockMovementDialog
              open={isDialogOpen}
              onOpenChange={(open) => void onOpenDialogChange(open)}
              dialogType={dialogType}
              setDialogType={setDialogType}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              selectedProduto={selectedProduto}
              setSelectedProduto={setSelectedProduto}
              quantidade={quantidade}
              setQuantidade={setQuantidade}
              responsavel={responsavel}
              setResponsavel={setResponsavel}
              observacao={observacao}
              setObservacao={setObservacao}
              produtos={produtos}
              motoristas={motoristas}
              onSubmit={() => void onSubmitMovimentacao()}
            />
          </div>
        </div>

        <StockMetricsCards statistics={statistics} />
      </div>

      <StockItemsGrid items={STOCK_ITEMS} estoque={estoque as StockMap} />

      <StockCharts chartData={chartData} distribuicaoData={distribuicaoData} />

      <StockCriticalAlerts
        items={STOCK_ITEMS}
        estoque={estoque as StockMap}
        onRepor={(itemKey) => {
          setDialogType("ENTRY");
          setSelectedItem(itemKey);
          void onOpenDialogChange(true);
        }}
      />

      <StockMovementsHistory
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        movimentacoes={movimentacoes}
        movimentacoesFiltradas={movimentacoesFiltradas}
        movimentacoesPaginas={movimentacoesPaginas}
        movimentacoesPage={movimentacoesPage}
        totalPages={totalPages}
        setMovimentacoesPage={setMovimentacoesPage}
      />

    </div>
  );
}

export * from "./stock/index";

