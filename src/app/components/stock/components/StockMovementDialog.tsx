import React from "react";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { motion } from "motion/react";
import type { DriverUser, PrecoProduto } from "../../../api";
import { EmptyStateAlert } from "../../alerts";
import { ResponsavelSelect } from "../../forms";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { ITEM_KEY_TO_PRODUCT_TYPE, STOCK_ITEMS } from "../stock.constants";
import type { ItemKeyEn, MovementDialogType } from "../stock.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogType: MovementDialogType;
  setDialogType: (type: MovementDialogType) => void;
  selectedItem: ItemKeyEn | "";
  setSelectedItem: (v: ItemKeyEn | "") => void;
  selectedProduto: string;
  setSelectedProduto: (v: string) => void;
  quantidade: number;
  setQuantidade: (v: number) => void;
  responsavel: string;
  setResponsavel: (v: string) => void;
  observacao: string;
  setObservacao: (v: string) => void;
  produtos: PrecoProduto[];
  motoristas: DriverUser[];
  onSubmit: () => void;
};

export function StockMovementDialog(props: Props) {
  const {
    open,
    onOpenChange,
    dialogType,
    setDialogType,
    selectedItem,
    setSelectedItem,
    selectedProduto,
    setSelectedProduto,
    quantidade,
    setQuantidade,
    responsavel,
    setResponsavel,
    observacao,
    setObservacao,
    produtos,
    motoristas,
    onSubmit,
  } = props;

  const produtosDaCategoria = selectedItem
    ? produtos.filter((produto) => produto.active === true && produto.type === ITEM_KEY_TO_PRODUCT_TYPE[selectedItem])
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setDialogType("ENTRY")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
          <DialogDescription>Adicione ou remova itens do estoque</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant={dialogType === "ENTRY" ? "default" : "outline"} className="flex-1" onClick={() => setDialogType("ENTRY")}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Entrada
            </Button>
            <Button variant={dialogType === "EXIT" ? "default" : "outline"} className="flex-1" onClick={() => setDialogType("EXIT")}>
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Saída
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Categoria *</Label>
            <select
              required
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e.target.value as ItemKeyEn | "");
                setSelectedProduto("");
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="">Selecione...</option>
              {STOCK_ITEMS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          {selectedItem && produtosDaCategoria.length === 0 && (
            <EmptyStateAlert
              title="Nenhum item encontrado para a categoria"
              description="Não há itens ativos para a categoria selecionada. Cadastre um item ou ative um existente."
            />
          )}

          {selectedItem && produtosDaCategoria.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="space-y-2">
                <Label>Item do Estoque *</Label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={selectedProduto}
                  onChange={(e) => setSelectedProduto(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {produtosDaCategoria.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label>Quantidade *</Label>
            <Input
              type="number"
              min="1"
              value={quantidade || ""}
              onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 0)}
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

          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onSubmit} className="w-full sm:w-auto">
              Registrar {dialogType === "ENTRY" ? "Entrada" : "Saída"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

