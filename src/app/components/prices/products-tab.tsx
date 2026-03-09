import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Switch } from "../ui/switch";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Download,
  Package,
  Edit,
  Trash2,
  Box,
  Ruler,
  Weight,
  ChevronLeft,
  ChevronRight,
  Minus,
} from "lucide-react";
import { PrecoProduto } from "../../types";
import {
  productsService,
  CreateProductPriceDTO,
  UpdateProductPriceDTO,
  ProductPricePagination,
} from "../../services/prices/products.service";

import { exportDocument } from "../../utils";
// import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY, ProductType } from "../stock";

const formProdutoInitial = {
  type: "SMALL_BOX" as
    | "SMALL_BOX"
    | "MEDIUM_BOX"
    | "LARGE_BOX"
    | "PERSONALIZED_ITEM"
    | "TAPE_ADHESIVE",
  name: "",
  dimensions: "",
  maxWeight: "",
  costPrice: "",
  salePrice: "",
  active: true,
  variablePrice: false,
};

export function ProdutosTab() {
  const { setPrecosProdutos, deletePrecoProduto } = useData();

  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false);
  const [isEditProdutoDialogOpen, setIsEditProdutoDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<PrecoProduto | null>(
    null,
  );
  const [formProduto, setFormProduto] = useState(formProdutoInitial);
  const [pageProduto, setPageProduto] = useState(1);
  const [limitProduto] = useState(10);
  const [paginationProduto, setPaginationProduto] =
    useState<ProductPricePagination | null>(null);

  const carregarProdutos = async (page = pageProduto) => {
    const result = await productsService.getAll(page, limitProduto);
    if (result.success && result.data) {
      setProdutos(result.data);
      setPrecosProdutos(result.data);
      if (result.pagination) setPaginationProduto(result.pagination);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    carregarProdutos(pageProduto);
  }, [pageProduto, limitProduto]);

  const resetFormProduto = () => {
    setFormProduto(formProdutoInitial);
  };

  const getCreatePayload = (): CreateProductPriceDTO => {
    const isBox =
      formProduto.type === "SMALL_BOX" ||
      formProduto.type === "MEDIUM_BOX" ||
      formProduto.type === "LARGE_BOX" ||
      formProduto.type === "PERSONALIZED_ITEM";
    const isTape = formProduto.type === "TAPE_ADHESIVE";
    const dimensions = isTape
      ? null
      : isBox && formProduto.dimensions
        ? formProduto.dimensions
        : undefined;
    const maxWeight = isTape
      ? null
      : isBox && formProduto.maxWeight
        ? parseFloat(formProduto.maxWeight)
        : undefined;
    const payload: CreateProductPriceDTO = {
      type: formProduto.type,
      name: formProduto.name,
      costPrice: parseFloat(formProduto.costPrice),
      salePrice: parseFloat(formProduto.salePrice),
      active: formProduto.active,
      variablePrice: formProduto.variablePrice,
    };
    if (dimensions !== undefined) payload.dimensions = dimensions;
    if (maxWeight !== undefined) payload.maxWeight = maxWeight;
    return payload;
  };

  const handleSubmitProduto = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = getCreatePayload();
    const result = await productsService.create(payload);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao cadastrar produto.");
      return;
    }

    toast.success("Produto cadastrado com sucesso!");
    resetFormProduto();
    setIsProdutoDialogOpen(false);
    setPageProduto(1);
    carregarProdutos(1);
  };

  const getUpdatePayload = (): UpdateProductPriceDTO => {
    const isBox =
      formProduto.type === "SMALL_BOX" ||
      formProduto.type === "MEDIUM_BOX" ||
      formProduto.type === "LARGE_BOX" ||
      formProduto.type === "PERSONALIZED_ITEM";
    const isTape = formProduto.type === "TAPE_ADHESIVE";
    const current: CreateProductPriceDTO = {
      type: formProduto.type,
      name: formProduto.name,
      dimensions: isTape
        ? null
        : isBox
          ? formProduto.dimensions || undefined
          : undefined,
      maxWeight: isTape
        ? null
        : isBox && formProduto.maxWeight
          ? parseFloat(formProduto.maxWeight)
          : undefined,
      costPrice: parseFloat(formProduto.costPrice),
      salePrice: parseFloat(formProduto.salePrice),
      active: formProduto.active,
      variablePrice: formProduto.variablePrice,
    };

    const original = selectedProduto!;
    const patch: UpdateProductPriceDTO = {};

    if (current.type !== original.type) patch.type = current.type;
    if (current.name !== original.name) patch.name = current.name;
    if (isTape) {
      const needsClear =
        original.type !== "TAPE_ADHESIVE" ||
        original.dimensions != null ||
        original.maxWeight != null;
      if (needsClear) {
        patch.dimensions = null;
        patch.maxWeight = null;
      }
    } else if (isBox) {
      const dimChanged =
        (current.dimensions ?? "") !== (original.dimensions ?? "");
      const weightChanged =
        (current.maxWeight ?? null) !== (original.maxWeight ?? null);
      if (dimChanged) {
        if (current.dimensions !== undefined && current.dimensions !== "")
          patch.dimensions = current.dimensions;
        else if (original.dimensions != null && original.dimensions !== "")
          patch.dimensions = null;
      }
      if (weightChanged) {
        if (current.maxWeight !== undefined && current.maxWeight !== null)
          patch.maxWeight = current.maxWeight;
        else if (original.maxWeight != null) patch.maxWeight = null;
      }
    }
    if (current.costPrice !== original.costPrice)
      patch.costPrice = current.costPrice;
    if (current.salePrice !== original.salePrice)
      patch.salePrice = current.salePrice;
    if (current.active !== original.active) patch.active = current.active;
    if (current.variablePrice !== original.variablePrice)
      patch.variablePrice = current.variablePrice;

    return patch;
  };

  const handleEditProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduto) return;

    const patchPayload = getUpdatePayload();

    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    const result = await productsService.update(
      selectedProduto.id,
      patchPayload,
    );

    if (result.success) {
      toast.success("Produto atualizado com sucesso!");
      resetFormProduto();
      setIsEditProdutoDialogOpen(false);
      setSelectedProduto(null);
      carregarProdutos(pageProduto);
    } else {
      toast.error(result.error || "Erro ao atualizar produto");
    }
  };

  const handleDeleteProduto = async (id: string) => {
    const confirm = window.confirm(
      "Tem certeza que deseja excluir este produto?",
    );

    if (confirm) {
      const result = await productsService.delete(id);

      if (result.success) {
        deletePrecoProduto(id);
        toast.success("Produto excluído com sucesso!");
        if (selectedProduto?.id === id) {
          setSelectedProduto(null);
        }
        carregarProdutos(pageProduto);
      } else {
        toast.error(result.error || "Erro ao excluir produto");
      }
    }
  };

  const handleExportProdutos = async () => {
    const result = await productsService.export();
    if (result.success && result.data) {
      if (!result.data.length) {
        toast.error("Nenhum produto cadastrado");
        return;
      }

      exportDocument.createPdf(result.data, "Products", "Products list");
      toast.success("Produtos exportados com sucesso");
      // console.log(result.data);
      // TODO: Exportar os dados para um arquivo PDF
    } else {
      toast.error(result.error || "Erro ao exportar produtos");
    }
  };

  const produtosFiltrados = produtos.filter(
    (p) => (p.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
    // (ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[p.type as ProductType]] ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tabela de Produtos</CardTitle>
              <CardDescription>Gerencie preços e produtos</CardDescription>
            </div>
            <Dialog
              open={isProdutoDialogOpen}
              onOpenChange={(open) => {
                setIsProdutoDialogOpen(open);
                if (open) {
                  resetFormProduto();
                  setSelectedProduto(null);
                  setIsEditProdutoDialogOpen(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F] hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Novo Produto</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo produto (caixa ou fita)
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 min-h-0 pr-1 -mx-1">
                  <form onSubmit={handleSubmitProduto} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select
                          value={formProduto.type}
                          onValueChange={(
                            value:
                              | "SMALL_BOX"
                              | "MEDIUM_BOX"
                              | "LARGE_BOX"
                              | "PERSONALIZED_ITEM"
                              | "TAPE_ADHESIVE",
                          ) =>
                            setFormProduto({
                              ...formProduto,
                              type: value,
                              ...(value === "TAPE_ADHESIVE"
                                ? {
                                    dimensions: undefined,
                                    maxWeight: undefined,
                                  }
                                : {}),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SMALL_BOX">
                              Caixa Pequena
                            </SelectItem>
                            <SelectItem value="MEDIUM_BOX">
                              Caixa Média
                            </SelectItem>
                            <SelectItem value="LARGE_BOX">
                              Caixa Grande
                            </SelectItem>
                            <SelectItem value="PERSONALIZED_ITEM">
                              Item Personalizado
                            </SelectItem>
                            <SelectItem value="TAPE_ADHESIVE">
                              Fita Adesiva
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome do Produto *</Label>
                        <Input
                          id="nome"
                          placeholder="Ex: Caixa Grande"
                          value={formProduto.name}
                          onChange={(e) =>
                            setFormProduto({
                              ...formProduto,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      {(formProduto.type === "SMALL_BOX" ||
                        formProduto.type === "MEDIUM_BOX" ||
                        formProduto.type === "LARGE_BOX" ||
                        formProduto.type === "PERSONALIZED_ITEM") && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="dimensoes">Dimensões</Label>
                            <Input
                              id="dimensoes"
                              placeholder="Ex: 40 x 30 x 25 (pol)"
                              value={formProduto.dimensions}
                              onChange={(e) =>
                                setFormProduto({
                                  ...formProduto,
                                  dimensions: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pesoMaximo">Peso Máximo (kg)</Label>
                            <Input
                              id="pesoMaximo"
                              type="number"
                              placeholder="Ex: 30"
                              value={formProduto.maxWeight}
                              onChange={(e) =>
                                setFormProduto({
                                  ...formProduto,
                                  maxWeight: e.target.value,
                                })
                              }
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-2 col-span-2">
                        <Label className="text-base font-semibold">
                          Preços
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precoCusto">
                          Preço de Custo (USD) *
                        </Label>
                        <Input
                          id="precoCusto"
                          type="number"
                          step="0.01"
                          min={0.01}
                          placeholder="Ex: 5.00"
                          value={formProduto.costPrice}
                          onChange={(e) =>
                            setFormProduto({
                              ...formProduto,
                              costPrice: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precoVenda">
                          Preço de Venda (USD) *
                        </Label>
                        <Input
                          id="precoVenda"
                          type="number"
                          step="0.01"
                          min={0.01}
                          placeholder="Ex: 10.00"
                          value={formProduto.salePrice}
                          onChange={(e) =>
                            setFormProduto({
                              ...formProduto,
                              salePrice: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 flex items-center gap-2 pt-5">
                        <Switch
                          id="precoVariavel"
                          checked={formProduto.variablePrice || false}
                          onCheckedChange={(checked) =>
                            setFormProduto({
                              ...formProduto,
                              variablePrice: checked,
                            })
                          }
                        />
                        <Label htmlFor="precoVariavel">Preço Variável</Label>
                      </div>

                      <div className="space-y-2 flex items-center gap-2 pt-5">
                        <Switch
                          id="ativoProduto"
                          checked={formProduto.active}
                          onCheckedChange={(checked) =>
                            setFormProduto({ ...formProduto, active: checked })
                          }
                        />
                        <Label htmlFor="ativoProduto">Produto Ativo</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProdutoDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F]"
                      >
                        Cadastrar
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportProdutos}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center">Produto</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-center">Detalhes</TableHead>
                  <TableHead className="text-center">Custo</TableHead>
                  <TableHead className="text-center">Venda</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum produto cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  produtosFiltrados.map((produto) => {
                    return (
                      <TableRow key={produto.id} className="hover:bg-muted/30">
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {produto.type.includes("BOX") ? (
                              <Box className="w-5 h-5 text-blue-600" />
                            ) : produto.type === "PERSONALIZED_ITEM" ? (
                              <Package className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Package className="w-5 h-5 text-orange-600" />
                            )}
                            <div>
                              <div className="font-medium">{produto.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {produto.type === "SMALL_BOX"
                              ? "Caixa Pequena"
                              : produto.type === "MEDIUM_BOX"
                                ? "Caixa Média"
                                : produto.type === "LARGE_BOX"
                                  ? "Caixa Grande"
                                  : produto.type === "PERSONALIZED_ITEM"
                                    ? "Item Personalizado"
                                    : "Fita Adesiva"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs space-y-1 flex flex-col items-center">
                            {produto.dimensions && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Ruler className="w-3 h-3" />
                                {produto.dimensions}
                              </div>
                            )}
                            {produto.maxWeight && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Weight className="w-3 h-3" />
                                {produto.maxWeight}kg
                              </div>
                            )}
                            {!produto.dimensions && !produto.maxWeight && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Minus className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-muted-foreground">
                            ${Number(produto.costPrice).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-green-700">
                            ${Number(produto.salePrice).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={produto.active ? "default" : "secondary"}
                          >
                            {produto.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduto(produto);
                                setFormProduto({
                                  type: produto.type,
                                  name: produto.name,
                                  dimensions: produto.dimensions || "",
                                  maxWeight:
                                    produto.maxWeight?.toString() || "",
                                  costPrice: produto.costPrice.toString(),
                                  salePrice: produto.salePrice.toString(),
                                  active: produto.active,
                                  variablePrice: produto.variablePrice || false,
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
          {paginationProduto && paginationProduto.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {paginationProduto.page} de{" "}
                {paginationProduto.totalPages}
                {paginationProduto.total > 0 && (
                  <> · {paginationProduto.total} registro(s)</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationProduto.hasPreviousPage}
                  onClick={() => setPageProduto((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationProduto.hasNextPage}
                  onClick={() =>
                    setPageProduto((p) =>
                      Math.min(paginationProduto.totalPages, p + 1),
                    )
                  }
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição de Produto */}
      <Dialog
        open={isEditProdutoDialogOpen}
        onOpenChange={setIsEditProdutoDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 -mx-1">
            <form onSubmit={handleEditProduto} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTipo">Tipo *</Label>
                  <Select
                    value={formProduto.type}
                    onValueChange={(
                      value:
                        | "SMALL_BOX"
                        | "MEDIUM_BOX"
                        | "LARGE_BOX"
                        | "PERSONALIZED_ITEM"
                        | "TAPE_ADHESIVE",
                    ) =>
                      setFormProduto({
                        ...formProduto,
                        type: value,
                        ...(value === "TAPE_ADHESIVE"
                          ? { dimensions: undefined, maxWeight: undefined }
                          : {}),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMALL_BOX">Caixa Pequena</SelectItem>
                      <SelectItem value="MEDIUM_BOX">Caixa Média</SelectItem>
                      <SelectItem value="LARGE_BOX">Caixa Grande</SelectItem>
                      <SelectItem value="PERSONALIZED_ITEM">
                        Item Personalizado
                      </SelectItem>
                      <SelectItem value="TAPE_ADHESIVE">
                        Fita Adesiva
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editNome">Nome do Produto *</Label>
                  <Input
                    id="editNome"
                    placeholder="Ex: Caixa Grande"
                    value={formProduto.name}
                    onChange={(e) =>
                      setFormProduto({ ...formProduto, name: e.target.value })
                    }
                    required
                  />
                </div>

                {(formProduto.type === "SMALL_BOX" ||
                  formProduto.type === "MEDIUM_BOX" ||
                  formProduto.type === "LARGE_BOX" ||
                  formProduto.type === "PERSONALIZED_ITEM") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="editDimensions">Dimensões</Label>
                      <Input
                        id="editDimensions"
                        placeholder="Ex: 40x30x25cm"
                        value={formProduto.dimensions}
                        onChange={(e) =>
                          setFormProduto({
                            ...formProduto,
                            dimensions: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editMaxWeight">Peso Máximo (kg)</Label>
                      <Input
                        id="editMaxWeight"
                        type="number"
                        step="0.1"
                        placeholder="Ex: 30"
                        value={formProduto.maxWeight}
                        onChange={(e) =>
                          setFormProduto({
                            ...formProduto,
                            maxWeight: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

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
                    value={formProduto.costPrice}
                    onChange={(e) =>
                      setFormProduto({
                        ...formProduto,
                        costPrice: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSalePrice">Preço de Venda (USD) *</Label>
                  <Input
                    id="editSalePrice"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10.00"
                    value={formProduto.salePrice}
                    onChange={(e) =>
                      setFormProduto({
                        ...formProduto,
                        salePrice: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2 flex items-center gap-2 pt-5">
                  <Switch
                    id="editVariablePrice"
                    checked={formProduto.variablePrice || false}
                    onCheckedChange={(checked) =>
                      setFormProduto({ ...formProduto, variablePrice: checked })
                    }
                  />
                  <Label htmlFor="editVariablePrice">Preço Variável</Label>
                </div>

                <div className="space-y-2 flex items-center gap-2 pt-5">
                  <Switch
                    id="editActiveProduto"
                    checked={formProduto.active}
                    onCheckedChange={(checked) =>
                      setFormProduto({ ...formProduto, active: checked })
                    }
                  />
                  <Label htmlFor="editActiveProduto">Produto Ativo</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditProdutoDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F]"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
