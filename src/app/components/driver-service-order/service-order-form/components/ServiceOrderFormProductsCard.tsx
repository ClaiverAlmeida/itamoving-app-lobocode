import React, { Fragment, useMemo } from "react";
import { Plus, Package, Trash2, Truck, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { Caixa, DeliveryPrice, Item, ProductPrice } from "../../../../api";
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "../../../stock";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { SearchableSelect } from "../../../forms";

type ResumoValores = {
  volumeCount: number;
  valorVolumes: number;
  valorFrete: number;
  valorTotal: number;
  temFrete: boolean;
};

/** Caixa de catálogo vinculada ao preço de entrega (somente exibição; não grava `productId` na linha da OS). */
function caixaCatalogoDoFrete(
  entrega: DeliveryPrice | undefined,
  opcoesCaixa: ProductPrice[],
): { name: string; typeLabel: string } | null {
  if (!entrega) return null;
  if (entrega.product) {
    const key = PRODUCT_TYPE_TO_ITEM_KEY[entrega.product.type];
    return { name: entrega.product.name, typeLabel: ITEM_LABELS[key] ?? entrega.product.type };
  }
  if (!entrega.productId) return null;
  const cat = opcoesCaixa.find((p) => p.id === entrega.productId);
  if (cat) {
    const key = PRODUCT_TYPE_TO_ITEM_KEY[cat.type];
    return { name: cat.name, typeLabel: ITEM_LABELS[key] ?? cat.type };
  }
  return { name: "Produto vinculado à rota", typeLabel: "Ver catálogo de preços" };
}

type Props = {
  caixas: Caixa[];
  itens: Item[];
  opcoesCaixa: ProductPrice[];
  /** Catálogo completo (metadados); o select usa só rotas ativas. */
  precosEntrega: DeliveryPrice[];
  valorTotalCaixas: number;
  resumoValoresProdutos: ResumoValores;
  adicionarCaixa: () => void;
  adicionarPrecoEntrega: () => void | Promise<void>;
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
    precosEntrega,
    valorTotalCaixas,
    resumoValoresProdutos,
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

  const rotasAtivas = useMemo(() => precosEntrega.filter((e) => e.active), [precosEntrega]);

  /** Volumes sempre acima do frete na lista (evita misturar rótulos de coluna com linha de rota). */
  const caixasVolumes = useMemo(() => caixas.filter((c) => c.lineKind !== "delivery"), [caixas]);
  const caixasFrete = useMemo(() => caixas.filter((c) => c.lineKind === "delivery"), [caixas]);
  const caixasOrdenadas = useMemo(() => [...caixasVolumes, ...caixasFrete], [caixasVolumes, caixasFrete]);

  return (
    <Card>
      <CardHeader className="bg-orange-50 rounded-t-lg border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
            <Package className="w-5 h-5" />
            Produtos e Valores
          </CardTitle>
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[280px]">
            <p className="text-[11px] font-medium text-[#1E3A5F]/80 uppercase tracking-wide">Incluir na ordem</p>
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
              <Button onClick={adicionarCaixa} size="sm" className="bg-[#F5A623] hover:bg-[#E59400] w-full sm:w-auto order-1">
                <Plus className="w-4 h-4 mr-1" />
                Volume ou produto
              </Button>
              <Button
                type="button"
                onClick={() => void adicionarPrecoEntrega()}
                size="sm"
                className="bg-[#2A4A6F] hover:bg-[#1E3A5F] w-full sm:w-auto order-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Preço de entrega
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {caixas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum volume, produto ou frete adicionado</p>
            <p className="text-sm">Use os botões acima para incluir linhas na ordem</p>
          </div>
        ) : (
          <div className="space-y-3">
            {caixasOrdenadas.map((caixa, idx) => {
              const anterior = idx > 0 ? caixasOrdenadas[idx - 1] : null;
              const isEntrega = caixa.lineKind === "delivery";
              const abrirSecaoVolumes =
                !isEntrega && (anterior == null || anterior.lineKind === "delivery");
              const abrirSecaoFrete =
                isEntrega && (anterior == null || anterior.lineKind !== "delivery");

              if (isEntrega) {
                const entregaSel = precosEntrega.find((e) => e.id === (caixa.deliveryPriceId ?? caixa.type));
                const caixaFreteCatalogo = caixaCatalogoDoFrete(entregaSel, opcoesCaixa);
                return (
                  <Fragment key={caixa.id}>
                    {abrirSecaoFrete ? (
                      <div
                        className={`space-y-1 rounded-lg border border-[#2A4A6F]/20 bg-sky-50/60 px-3 py-2 text-[#1E3A5F] ${
                          anterior != null ? "mt-6 border-t border-dashed border-[#2A4A6F]/30 pt-4" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Truck className="h-4 w-4 shrink-0 text-[#2A4A6F]" aria-hidden />
                          Frete e rotas
                        </div>
                        <p className="text-xs text-muted-foreground pl-6 leading-snug">
                          Frete e valor do frete — separado do catálogo de volumes e produtos.
                        </p>
                      </div>
                    ) : null}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-[#2A4A6F]/20 bg-gradient-to-br from-slate-50/90 via-white to-sky-50/40 p-4 shadow-sm space-y-4"
                    >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2A4A6F] text-white shrink-0">
                          <Truck className="h-4 w-4" />
                        </span>
                        Linha de frete
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
                      <div className="flex-1 min-w-0 space-y-1">
                        <Label className="text-xs font-medium text-[#1E3A5F]">Frete (ativos)</Label>
                        <SearchableSelect
                          className="space-y-0"
                          items={rotasAtivas.map((e) => ({
                            value: e.id,
                            label: e.routeName,
                            searchValue: [e.routeName, e.id].filter(Boolean).join(" "),
                          }))}
                          value={caixa.deliveryPriceId ?? caixa.type}
                          onValueChange={(valor) => atualizarCaixa(caixa.id, "type", valor)}
                          placeholder="Selecione a rota de entrega"
                          searchPlaceholder="Buscar rota..."
                          emptyMessage="Nenhuma rota ativa. Cadastre ou ative um preço de entrega."
                          triggerClassName="bg-white w-full border-[#2A4A6F]/25"
                          itemIcon={Truck}
                        />
                      </div>
                      <div className="w-full lg:w-44 shrink-0 space-y-1">
                        <Label className="text-xs font-medium text-[#1E3A5F]">Valor do frete ($)</Label>
                        <Input
                          type="number"
                          value={caixa.value === 0 ? "" : caixa.value}
                          onChange={(e) => atualizarCaixa(caixa.id, "value", parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          step="0.01"
                          className="bg-white"
                          disabled={!entregaSel?.isVariablePrice}
                        />
                      </div>
                      <div className="flex justify-end lg:pb-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removerCaixa(caixa.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label="Remover linha de frete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {entregaSel ? (
                      <div className="rounded-lg border border-sky-200/80 bg-white/90 p-4 shadow-inner space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2A4A6F]/75">Frete</p>
                            <p className="text-base font-semibold text-[#1E3A5F] leading-snug">{entregaSel.routeName}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            {entregaSel.isVariablePrice ? (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-950 border-amber-200/80">
                                Frete com valor variável
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-sky-300 text-sky-900 bg-sky-50/80">
                                Valor fixo
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0 text-[#2A4A6F]" aria-hidden />
                            <span>
                              Prazo:{" "}
                              <strong className="text-foreground tabular-nums">
                                {entregaSel.deliveryDeadline} {entregaSel.deliveryDeadline === 1 ? "dia" : "dias"}
                              </strong>
                            </span>
                          </div>
                          <div className="h-4 w-px bg-border hidden sm:block" aria-hidden />
                          <div className="text-muted-foreground">
                            Referência:{" "}
                            <strong className="text-foreground tabular-nums">${Number(entregaSel.totalPrice).toFixed(2)}</strong>
                          </div>
                        </div>

                        <p className="text-[11px] leading-snug text-muted-foreground">
                          {caixaFreteCatalogo ? (
                            <>
                              <span className="font-medium text-[#2A4A6F]/85">Caixa:</span>{" "}
                              <span className="text-foreground/90">{caixaFreteCatalogo.name}</span>
                              <span className="text-muted-foreground/90"> ({caixaFreteCatalogo.typeLabel})</span>
                            </>
                          ) : (
                            <span className="italic">Sem caixa vinculada no cadastro desta rota.</span>
                          )}
                        </p>
                      </div>
                    ) : null}
                  </motion.div>
                  </Fragment>
                );
              }

              const itensDaCaixa = itens.filter((i) => i.caixaId === caixa.id);
              const pesoItensDaCaixa = itensDaCaixa.reduce((acc, item) => acc + item.weight, 0).toFixed(2);
              const pesoTotalCaixa =
                caixa.weight != null && caixa.weight > 0 ? parseFloat(Number(caixa.weight).toFixed(2)) : 0;
              const isGreaterThanPesoTotalCaixa =
                Number(pesoItensDaCaixa) > Number(pesoTotalCaixa) ? "text-red-500" : "";
              const podeAdicionarItens = caixaTemTodosCamposPreenchidos(caixa);
              const fitaAdesiva = isFitaAdesiva(caixa, opcoesCaixa);
              const mostrarBlocoItens = !fitaAdesiva && itensDaCaixa.length > 0;

              return (
                <Fragment key={caixa.id}>
                  {abrirSecaoVolumes ? (
                    <div className="space-y-1 rounded-lg border border-border bg-orange-50/50 px-3 py-2 text-[#1E3A5F]">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Package className="h-4 w-4 shrink-0 text-[#F5A623]" aria-hidden />
                        Volumes e produtos
                      </div>
                      <p className="text-xs text-muted-foreground pl-6 leading-snug">
                        Tipo no catálogo, peso total e valor. Não use este bloco para escolher rota de entrega.
                      </p>
                    </div>
                  ) : null}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-gray-50/90 p-3 shadow-sm space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 md:items-end">
                    <div className="md:col-span-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2 min-w-0">
                      <div className="flex-1 min-w-0 space-y-1">
                        <Label className="text-xs font-medium text-[#1E3A5F]">Tipo do volume ou produto</Label>
                        <SearchableSelect
                          className="space-y-0"
                          items={opcoesCaixa.map((opcao) => ({
                            value: opcao.size || opcao.name,
                            label: `${opcao.name} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[opcao.type]]}`,
                            searchValue: [opcao.name, opcao.size, opcao.type, opcao.id].filter(Boolean).join(" "),
                          }))}
                          value={caixa.type}
                          onValueChange={(valor) => atualizarCaixa(caixa.id, "type", valor)}
                          placeholder="Ex.: caixa média, fita…"
                          searchPlaceholder="Buscar no catálogo..."
                          emptyMessage="Nenhum tipo encontrado."
                          triggerClassName="bg-white w-full"
                          itemIcon={Package}
                        />
                      </div>
                      {!fitaAdesiva ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={!podeAdicionarItens}
                          title={
                            podeAdicionarItens
                              ? "Adicionar itens neste volume"
                              : "Preencha tipo, peso e valor do volume antes de adicionar itens"
                          }
                          className="shrink-0 rounded-sm bg-[#F5A623] hover:bg-[#E59400] w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
                          onClick={() => adicionarItens(caixa.id)}
                        >
                          <Plus className="w-5 h-5" />
                          Itens
                        </Button>
                      ) : null}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs font-medium text-[#1E3A5F]">Peso total do volume (kg)</Label>
                      <Input
                        type="number"
                        value={caixa.weight == null || caixa.weight === 0 ? "" : caixa.weight}
                        onChange={(e) => atualizarCaixa(caixa.id, "weight", parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        step="0.1"
                        className="bg-white"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-xs font-medium text-[#1E3A5F]">Valor do volume ($)</Label>
                      <Input
                        type="number"
                        value={caixa.value === 0 ? "" : caixa.value}
                        onChange={(e) => atualizarCaixa(caixa.id, "value", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        className="bg-white"
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

                  {mostrarBlocoItens ? (
                    <div className="rounded-lg border border-dashed border-border bg-white p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Itens deste volume</p>
                      {itensDaCaixa.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-1 sm:grid-cols-11 gap-2 rounded-md border bg-muted/30 p-2">
                          <div className="sm:col-span-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Nº</Label>
                            <div className="flex h-9 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                              {idx + 1}
                            </div>
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
                            <Input
                              type="text"
                              value={item.observations ?? ""}
                              onChange={(e) => atualizarItem(item.id, "observations", e.target.value)}
                              placeholder="Observações"
                            />
                          </div>
                          <div className="sm:col-span-1 space-y-1">
                            <Label className="text-xs text-transparent select-none pointer-events-none" aria-hidden>
                              {"\u00A0"}
                            </Label>
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removerItens(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label="Remover item"
                              >
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
                  ) : null}
                </motion.div>
                </Fragment>
              );
            })}

            <div className="flex justify-end pt-3 border-t">
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">Volumes / produtos catálogo:</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">{resumoValoresProdutos.volumeCount}</p>
                {resumoValoresProdutos.temFrete ? (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Subtotal volumes (sem frete):</p>
                    <p className="text-lg font-semibold text-[#1E3A5F]">$ {resumoValoresProdutos.valorVolumes.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-2">Subtotal frete:</p>
                    <p className="text-lg font-semibold text-[#2A4A6F]">$ {resumoValoresProdutos.valorFrete.toFixed(2)}</p>
                  </>
                ) : null}
                <p className="text-sm text-muted-foreground mt-2">Valor total:</p>
                <p className="text-2xl font-bold text-green-600">$ {valorTotalCaixas.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
