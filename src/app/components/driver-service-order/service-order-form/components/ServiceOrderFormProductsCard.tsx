import React from "react";
import { Plus, Package, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { Caixa, Item, ProductPrice } from "../../../../api";
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "../../../stock";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { SearchableSelect } from "../../../forms";

type Props = {
  caixas: Caixa[];
  itens: Item[];
  opcoesCaixa: ProductPrice[];
  valorTotalCaixas: number;
  adicionarCaixa: () => void;
  adicionarPrecoEntrega: () => void;
  atualizarCaixa: (id: string, campo: keyof Caixa, valor: string | number) => void;
  removerCaixa: (id: string) => void;
  adicionarItens: (caixaId: string) => void;
  atualizarItem: (id: string, campo: keyof Item, valor: string | number) => void;
  removerItens: (id: string) => void;
  caixaTemTodosCamposPreenchidos: (caixa: Caixa) => boolean;
  isFitaAdesiva: (caixa: Caixa, opcoesCaixa: ProductPrice[]) => boolean;
};

export function ServiceOrderFormProductsCard(props: Props) {
  const {
    caixas,
    itens,
    opcoesCaixa,
    valorTotalCaixas,
    adicionarCaixa,
    adicionarPrecoEntrega,
    atualizarCaixa,
    removerCaixa,
    adicionarItens,
    atualizarItem,
    removerItens,
    caixaTemTodosCamposPreenchidos,
    isFitaAdesiva,
  } = props;

  return (
    <Card>
      <CardHeader className="bg-orange-50 rounded-t-lg border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
            <Package className="w-5 h-5" />
            Produtos e Valores
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button onClick={adicionarCaixa} size="sm" className="bg-[#F5A623] hover:bg-[#E59400] w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar volume ou produto
            </Button>
            <Button onClick={adicionarPrecoEntrega} size="sm" className="bg-[#2A4A6F] hover:bg-[#1E3A5F] w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar preço de entrega
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {caixas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum volume ou produto adicionado</p>
            <p className="text-sm">Clique em &quot;Adicionar volume ou produto&quot; para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:grid md:grid-cols-11 gap-3 text-sm font-semibold text-muted-foreground border-b pb-2">
              <div className="col-span-5 text-center">Tipo do volume ou produto</div>
              <div className="col-span-2 text-center">Peso (kg)</div>
              <div className="col-span-3 text-center">Valor ($)</div>
              <div className="col-span-1 text-center" />
            </div>
            {caixas.map((caixa) => {
              const itensDaCaixa = itens.filter((i) => i.caixaId === caixa.id);
              const pesoItensDaCaixa = itensDaCaixa.reduce((acc, item) => acc + item.weight, 0).toFixed(2);
              const pesoTotalCaixa = caixa.weight ? parseFloat(caixa.weight.toFixed(2)) : 0;
              const isGreaterThanPesoTotalCaixa = Number(pesoItensDaCaixa) > Number(pesoTotalCaixa) ? "text-red-500" : "";
              const podeAdicionarItens = caixaTemTodosCamposPreenchidos(caixa);
              const fitaAdesiva = isFitaAdesiva(caixa, opcoesCaixa);
              return (
                <motion.div key={caixa.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-gray-50/90 p-3 shadow-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
                    <div className="md:col-span-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2 min-w-0">
                      <div className="flex-1 min-w-0 space-y-1">
                        <SearchableSelect
                          className="space-y-0"
                          items={opcoesCaixa.map((opcao) => ({
                            value: opcao.size || opcao.name,
                            label: `${opcao.name} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[opcao.type]]}`,
                            searchValue: [opcao.name, opcao.size, opcao.type, opcao.id].filter(Boolean).join(" "),
                          }))}
                          value={caixa.type}
                          onValueChange={(valor) => atualizarCaixa(caixa.id, "type", valor)}
                          placeholder="Selecione o tipo"
                          searchPlaceholder="Buscar tipo de volume..."
                          emptyMessage="Nenhum tipo encontrado."
                          triggerClassName="bg-white w-full"
                          itemIcon={Package}
                        />
                      </div>
                      {!fitaAdesiva && (
                        <Button type="button" size="sm" disabled={!podeAdicionarItens} title={podeAdicionarItens ? "Adicionar itens neste volume" : "Preencha tipo, peso e valor do volume antes de adicionar itens"} className="shrink-0 rounded-sm bg-[#F5A623] hover:bg-[#E59400] w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none" onClick={() => adicionarItens(caixa.id)}>
                          <Plus className="w-5 h-5" />
                          Itens
                        </Button>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label className="md:hidden mb-2">Peso (kg)</Label>
                      <Input
                        type="number"
                        value={caixa.weight === 0 ? "" : caixa.weight}
                        onChange={(e) => atualizarCaixa(caixa.id, "weight", parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        step="0.1"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label className="md:hidden mb-2">Valor</Label>
                      <Input
                        type="number"
                        value={caixa.value === 0 ? "" : caixa.value}
                        onChange={(e) => atualizarCaixa(caixa.id, "value", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        disabled={
                          !opcoesCaixa.find(
                            (p) =>
                              p.type === caixa.type ||
                              p.name === caixa.type ||
                              p.size === caixa.type ||
                              (p.dimensions != null && p.dimensions === caixa.type),
                          )?.variablePrice
                        }
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end md:justify-center">
                      <Button variant="ghost" size="icon" onClick={() => removerCaixa(caixa.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {itensDaCaixa.length > 0 && (
                    <div className="rounded-lg border border-dashed border-border bg-white p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Itens deste volume</p>
                      {itensDaCaixa.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-1 sm:grid-cols-11 gap-2 rounded-md border bg-muted/30 p-2">
                          <div className="sm:col-span-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Nº</Label>
                            <div className="flex h-9 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">{idx + 1}</div>
                          </div>
                          <div className="sm:col-span-3 space-y-1">
                            <Label className="text-xs text-muted-foreground">Nome do item</Label>
                            <Input value={item.name} onChange={(e) => atualizarItem(item.id, "name", e.target.value)} placeholder="Nome do item" />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-xs text-muted-foreground">Quantidade</Label>
                            <Input
                              value={item.quantity === 0 ? "" : item.quantity}
                              type="number"
                              min={0}
                              onChange={(e) => atualizarItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-xs text-muted-foreground">Peso (kg)</Label>
                            <Input
                              type="number"
                              min={0}
                              step="0.1"
                              value={item.weight === 0 ? "" : item.weight}
                              onChange={(e) => atualizarItem(item.id, "weight", parseFloat(e.target.value) || 0)}
                              placeholder="kg"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-xs text-muted-foreground">Observações</Label>
                            <Input type="text" value={item.observations ?? ""} onChange={(e) => atualizarItem(item.id, "observations", e.target.value)} placeholder="Observações" />
                          </div>
                          <div className="sm:col-span-1 space-y-1">
                            <Label className="text-xs text-transparent select-none pointer-events-none" aria-hidden>
                              {"\u00A0"}
                            </Label>
                            <div className="flex justify-end">
                              <Button type="button" variant="ghost" size="icon" onClick={() => removerItens(item.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50" aria-label="Remover item">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex flex-col justify-end gap-2 items-start sm:items-end">
                        <div className="flex gap-2">
                          <p className="text-sm text-muted-foreground font-semibold">Total de itens do volume:</p>
                          <p className="text-sm text-muted-foreground">{itensDaCaixa.length}</p>
                        </div>
                        <div className="flex gap-2">
                          <p className={`text-sm text-muted-foreground font-semibold ${isGreaterThanPesoTotalCaixa}`}>Peso Total dos Itens:</p>
                          <p className={`text-sm text-muted-foreground ${isGreaterThanPesoTotalCaixa}`}>{pesoItensDaCaixa} kg</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            <div className="flex justify-end pt-3 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total de volumes:</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">{caixas.length}</p>
                <p className="text-sm text-muted-foreground mt-2">Valor Total:</p>
                <p className="text-2xl font-bold text-green-600">$ {valorTotalCaixas.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

