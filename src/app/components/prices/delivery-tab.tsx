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
  MapPin,
  Edit,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PrecoEntrega } from "../../types";
import { BRASIL_STATES, EUA_STATES, exportDocument } from "../../utils/";
import {
  CreateDeliveryPriceDTO,
  DeliveryPricesPagination,
  UpdateDeliveryPriceEntregaDTO,
  deliveryPricesService,
} from "../../services/prices/delivery.service";

function toUfBrasil(val: string): string {
  if (!val) return val;
  const found = BRASIL_STATES.find(
    (s) => s.uf === val || s.nome.toLowerCase() === val.toLowerCase(),
  );
  return found ? found.uf : val;
}
function toUfEua(val: string): string {
  if (!val) return val;
  const found = EUA_STATES.find(
    (s) => s.uf === val || s.nome.toLowerCase() === val.toLowerCase(),
  );
  return found ? found.uf : val;
}

const formEntregaInitial = {
  originCity: "",
  originState: "",
  destinationCity: "",
  destinationState: "",
  pricePerKg: "",
  minimumPrice: "",
  deliveryDeadline: "",
  active: true,
};

export function PrecosEntregaTab() {
  const { setPrecosEntrega, deletePrecoEntrega } = useData();

  const [entregas, setEntregas] = useState<PrecoEntrega[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
  const [isEditEntregaDialogOpen, setIsEditEntregaDialogOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<PrecoEntrega | null>(
    null,
  );
  const [formEntrega, setFormEntrega] = useState(formEntregaInitial);
  const [pageEntrega, setPageEntrega] = useState(1);
  const [limitEntrega] = useState(10);
  const [paginationEntrega, setPaginationEntrega] =
    useState<DeliveryPricesPagination | null>(null);

  const carregarPrecosEntrega = async (page = pageEntrega) => {
    const result = await deliveryPricesService.getAll(page, limitEntrega);
    if (result.success && result.data) {
      setEntregas(result.data);
      setPrecosEntrega(result.data);
      if (result.pagination) setPaginationEntrega(result.pagination);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    carregarPrecosEntrega(pageEntrega);
  }, [pageEntrega, limitEntrega]);

  const resetFormEntrega = () => {
    setFormEntrega(formEntregaInitial);
  };

  const getCreatePayload = (): CreateDeliveryPriceDTO => ({
    originCity: formEntrega.originCity,
    originState: formEntrega.originState,
    destinationCity: formEntrega.destinationCity,
    destinationState: formEntrega.destinationState,
    pricePerKg:
      parseFloat(String(formEntrega.pricePerKg).replace(",", ".")) || 0,
    minimumPrice:
      parseFloat(String(formEntrega.minimumPrice).replace(",", ".")) || 0,
    deliveryDeadline: parseInt(String(formEntrega.deliveryDeadline), 10) || 0,
    active: formEntrega.active,
  });

  const handleSubmitEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = getCreatePayload();
    const result = await deliveryPricesService.create(payload);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao cadastrar preço de entrega.");
      return;
    }

    toast.success("Preço de entrega cadastrado com sucesso!");
    resetFormEntrega();
    setIsEntregaDialogOpen(false);
    setPageEntrega(1);
    carregarPrecosEntrega(1);
  };

  const getUpdatePayload = (): UpdateDeliveryPriceEntregaDTO => {
    const current: CreateDeliveryPriceDTO = {
      originCity: formEntrega.originCity,
      originState: formEntrega.originState,
      destinationCity: formEntrega.destinationCity,
      destinationState: formEntrega.destinationState,
      pricePerKg:
        parseFloat(String(formEntrega.pricePerKg).replace(",", ".")) || 0,
      minimumPrice:
        parseFloat(String(formEntrega.minimumPrice).replace(",", ".")) || 0,
      deliveryDeadline: parseInt(String(formEntrega.deliveryDeadline), 10) || 0,
      active: formEntrega.active,
    };

    const original = selectedEntrega!;
    const patch: UpdateDeliveryPriceEntregaDTO = {};

    if (current.originCity !== original.originCity)
      patch.originCity = current.originCity;
    if (current.originState !== original.originState)
      patch.originState = current.originState;
    if (current.destinationCity !== original.destinationCity)
      patch.destinationCity = current.destinationCity;
    if (current.destinationState !== original.destinationState)
      patch.destinationState = current.destinationState;
    if (current.pricePerKg !== original.pricePerKg)
      patch.pricePerKg = current.pricePerKg;
    if (current.minimumPrice !== original.minimumPrice)
      patch.minimumPrice = current.minimumPrice;
    if (current.deliveryDeadline !== original.deliveryDeadline)
      patch.deliveryDeadline = current.deliveryDeadline;
    if (current.active !== original.active) patch.active = current.active;
    return patch;
  };

  const handleEditEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntrega) return;

    const patchPayload = getUpdatePayload();

    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    const result = await deliveryPricesService.update(
      selectedEntrega.id,
      patchPayload,
    );

    if (result.success) {
      toast.success("Preço de entrega atualizado com sucesso!");
      resetFormEntrega();
      setIsEditEntregaDialogOpen(false);
      setSelectedEntrega(null);
      carregarPrecosEntrega(pageEntrega);
    } else {
      toast.error(result.error || "Erro ao atualizar preço de entrega");
    }
  };

  const handleDeleteEntrega = async (id: string) => {
    const confirm = window.confirm(
      "Tem certeza que deseja excluir este preço de entrega?",
    );

    if (confirm) {
      const result = await deliveryPricesService.delete(id);

      if (result.success) {
        deletePrecoEntrega(id);
        toast.success("Preço de entrega excluído com sucesso!");
        if (selectedEntrega?.id === id) {
          setSelectedEntrega(null);
        }
        carregarPrecosEntrega(pageEntrega);
      } else {
        toast.error(result.error || "Erro ao excluir preço de entrega");
      }
    }
  };

  const handleExportarEntregas = async () => {
    const result = await deliveryPricesService.export();
    if (result.success && result.data) {
      if (!result.data.length) {
        toast.error("Nenhum preço de entrega cadastrado");
        return;
      }

      exportDocument.createPdf(
        result.data,
        "Delivery Prices",
        "Delivery prices list",
      );
      toast.success("Preços de entrega exportados com sucesso");
      // console.log(result.data);
      // TODO: Exportar os dados para um arquivo PDF
    } else {
      toast.error(result.error || "Erro ao exportar produtos");
    }
  };

  const entregasFiltradas = entregas.filter(
    (p) =>
      (p.originCity ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.destinationCity ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.originState ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.destinationState ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preços de Entrega por Cidade</CardTitle>
              <CardDescription>
                Configure os preços de frete entre cidades EUA-Brasil
              </CardDescription>
            </div>
            <Dialog
              open={isEntregaDialogOpen}
              onOpenChange={(open) => {
                setIsEntregaDialogOpen(open);
                if (open) {
                  resetFormEntrega();
                  setSelectedEntrega(null);
                  setIsEditEntregaDialogOpen(false);
                }
              }}
            >
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
                      <Label className="text-base font-semibold">
                        Origem (EUA)
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originCity">Cidade *</Label>
                      <Input
                        id="originCity"
                        placeholder="Ex: Miami"
                        value={formEntrega.originCity}
                        onChange={(e) =>
                          setFormEntrega({
                            ...formEntrega,
                            originCity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originState">Estado *</Label>
                      <Select
                        value={formEntrega.originState}
                        onValueChange={(value) =>
                          setFormEntrega({
                            ...formEntrega,
                            originState: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado dos EUA" />
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

                    <div className="space-y-2 col-span-2">
                      <Label className="text-base font-semibold">
                        Destino (Brasil)
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinationCity">Cidade *</Label>
                      <Input
                        id="destinationCity"
                        placeholder="Ex: São Paulo"
                        value={formEntrega.destinationCity}
                        onChange={(e) =>
                          setFormEntrega({
                            ...formEntrega,
                            destinationCity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinationState">Estado *</Label>
                      <Select
                        value={formEntrega.destinationState}
                        onValueChange={(value) =>
                          setFormEntrega({
                            ...formEntrega,
                            destinationState: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado do Brasil" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRASIL_STATES.map(({ uf, nome }) => (
                            <SelectItem key={uf} value={uf}>
                              {uf} - {nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label className="text-base font-semibold">
                        Preços e Prazo
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerKg">Preço por Kg (USD) *</Label>
                      <Input
                        id="pricePerKg"
                        type="number"
                        step="0.01"
                        min={0.01}
                        placeholder="Ex: 8.50"
                        value={formEntrega.pricePerKg}
                        onChange={(e) =>
                          setFormEntrega({
                            ...formEntrega,
                            pricePerKg: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimumPrice">Preço Mínimo (USD) *</Label>
                      <Input
                        id="minimumPrice"
                        type="number"
                        step="0.01"
                        min={0.01}
                        placeholder="Ex: 150.00"
                        value={formEntrega.minimumPrice}
                        onChange={(e) =>
                          setFormEntrega({
                            ...formEntrega,
                            minimumPrice: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDeadline">
                        Prazo de Entrega (dias) *
                      </Label>
                      <Input
                        id="deliveryDeadline"
                        type="number"
                        placeholder="Ex: 30"
                        min={1}
                        value={formEntrega.deliveryDeadline}
                        onChange={(e) =>
                          setFormEntrega({
                            ...formEntrega,
                            deliveryDeadline: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2 flex items-center gap-2">
                      <Switch
                        id="activeEntrega"
                        checked={formEntrega.active}
                        onCheckedChange={(checked) =>
                          setFormEntrega({
                            ...formEntrega,
                            active: checked,
                          })
                        }
                      />
                      <Label htmlFor="activeEntrega">Rota Ativa</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEntregaDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]"
                    >
                      Cadastrar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportarEntregas}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center">Origem</TableHead>
                  <TableHead className="text-center">Destino</TableHead>
                  <TableHead className="text-center">Preço/Kg</TableHead>
                  <TableHead className="text-center">Mínimo</TableHead>
                  <TableHead className="text-center">Prazo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entregasFiltradas.length === 0 ? (
                  <TableRow className="text-center justify-center">
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground justify-center text-center"
                    >
                      Nenhum preço de entrega cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  entregasFiltradas.map((entrega) => (
                    <TableRow
                      key={entrega.id}
                      className="hover:bg-muted/30 text-center justify-center"
                    >
                      <TableCell className="text-center justify-center">
                        <div className="flex items-center gap-2 justify-center">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">
                              {entrega.originCity}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entrega.originState}, USA
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center justify-center">
                        <div className="flex items-center gap-2 justify-center">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="font-medium">
                              {entrega.destinationCity}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entrega.destinationState}, Brasil
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center justify-center">
                        <span className="font-semibold text-green-700">
                          ${Number(entrega.pricePerKg).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center justify-center">
                        <span className="text-muted-foreground">
                          ${Number(entrega.minimumPrice).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center justify-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>{entrega.deliveryDeadline} dias</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center justify-center">
                        <Badge
                          variant={entrega.active ? "default" : "secondary"}
                        >
                          {entrega.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center justify-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEntrega(entrega);
                              setFormEntrega({
                                originCity: entrega.originCity,
                                originState: toUfEua(entrega.originState),
                                destinationCity: entrega.destinationCity,
                                destinationState: toUfBrasil(
                                  entrega.destinationState,
                                ),
                                pricePerKg: entrega.pricePerKg.toString(),
                                minimumPrice: entrega.minimumPrice.toString(),
                                deliveryDeadline:
                                  entrega.deliveryDeadline.toString(),
                                active: entrega.active,
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
          {paginationEntrega && paginationEntrega.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {paginationEntrega.page} de{" "}
                {paginationEntrega.totalPages}
                {paginationEntrega.total > 0 && (
                  <> · {paginationEntrega.total} registro(s)</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationEntrega.hasPreviousPage}
                  onClick={() => setPageEntrega((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationEntrega.hasNextPage}
                  onClick={() =>
                    setPageEntrega((p) =>
                      Math.min(paginationEntrega.totalPages, p + 1),
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

      {/* Dialog de Edição de Entrega */}
      <Dialog
        open={isEditEntregaDialogOpen}
        onOpenChange={(open) => {
          setIsEditEntregaDialogOpen(open);
          if (!open) {
            setSelectedEntrega(null);
          } else {
            setIsEntregaDialogOpen(false);
          }
        }}
      >
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
                <Label htmlFor="editOriginCity">Cidade *</Label>
                <Input
                  id="editOriginCity"
                  placeholder="Ex: Miami"
                  value={formEntrega.originCity}
                  onChange={(e) =>
                    setFormEntrega({
                      ...formEntrega,
                      originCity: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOriginState">Estado *</Label>
                <Select
                  value={formEntrega.originState}
                  onValueChange={(value) =>
                    setFormEntrega({ ...formEntrega, originState: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado dos EUA" />
                  </SelectTrigger>
                  <SelectContent>
                    {EUA_STATES.map(({ uf, nome }) => (
                      <SelectItem key={uf} value={uf}>
                        {uf} - {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-base font-semibold">
                  Destino (Brasil)
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDestinationCity">Cidade *</Label>
                <Input
                  id="editDestinationCity"
                  placeholder="Ex: São Paulo"
                  value={formEntrega.destinationCity}
                  onChange={(e) =>
                    setFormEntrega({
                      ...formEntrega,
                      destinationCity: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDestinationState">Estado *</Label>
                <Select
                  value={formEntrega.destinationState}
                  onValueChange={(value) =>
                    setFormEntrega({ ...formEntrega, destinationState: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado do Brasil" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRASIL_STATES.map(({ uf, nome }) => (
                      <SelectItem key={uf} value={uf}>
                        {uf} - {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-base font-semibold">
                  Preços e Prazo
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrecoPorKg">Preço por Kg (USD) *</Label>
                <Input
                  id="editPrecoPorKg"
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="Ex: 8.50"
                  value={formEntrega.pricePerKg}
                  onChange={(e) =>
                    setFormEntrega({
                      ...formEntrega,
                      pricePerKg: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMinimumPrice">Preço Mínimo (USD) *</Label>
                <Input
                  id="editMinimumPrice"
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="Ex: 150.00"
                  value={formEntrega.minimumPrice}
                  onChange={(e) =>
                    setFormEntrega({
                      ...formEntrega,
                      minimumPrice: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDeliveryDeadline">
                  Prazo de Entrega (dias) *
                </Label>
                <Input
                  id="editDeliveryDeadline"
                  type="number"
                  placeholder="Ex: 30"
                  min={1}
                  value={formEntrega.deliveryDeadline}
                  onChange={(e) =>
                    setFormEntrega({
                      ...formEntrega,
                      deliveryDeadline: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  id="editActive"
                  checked={formEntrega.active}
                  onCheckedChange={(checked) =>
                    setFormEntrega({ ...formEntrega, active: !!checked })
                  }
                />
                <Label htmlFor="editActive">Rota Ativa</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditEntregaDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2]"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
