import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Truck, CheckCircle, User, Box, Download, DollarSign, FileText } from "lucide-react";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import type { DriverServiceOrderView } from "../../../../api";
import {
  RECIBO_CATEGORY_LABEL,
  formatUsdValorRecebidoLivre,
  saldoPendentePagamentoOrdem,
  summarizeOrdemForRecibo,
  sumValorFreteOrdem,
  sumValorTotalCaixasFromOrdem,
  sumValorVolumesProdutosOrdem,
  totalGeralConsolidadoOrdem,
  totalRecebidoPagamentoOrdem,
  type ReciboBoxCategory,
} from "../delivery-receipt-utils";

export const DEFAULT_DELIVERY_RECEIPT_PRINT_ID = "delivery-receipt-print";

export type DeliveryReceiptProps = {
  ordem: DriverServiceOrderView;
  /** Se o GET não trouxer o agendamento completo (ex.: resposta logo após criar a ordem). */
  valorAgendamento?: number;
  valorAntecipacao?: number;
  companyContactPhone?: string;
  printElementId?: string;
  className?: string;
  onShowOrdersScreen?: () => void;
  onPrint?: () => void;
  backLabel?: string;
  printLabel?: string;
};

export function DeliveryReceipt({
  ordem,
  valorAgendamento: valorAgendamentoProp,
  valorAntecipacao: valorAntecipacaoProp,
  companyContactPhone,
  printElementId = DEFAULT_DELIVERY_RECEIPT_PRINT_ID,
  className,
  onShowOrdersScreen,
  onPrint,
  backLabel = "← Ver Minhas Ordens",
  printLabel = "Imprimir Recibo",
}: DeliveryReceiptProps) {
  const itamovingLogo = new URL("../../../../../assets/itamoving-logo.png", import.meta.url).href;
  const { rows: reciboRows, summary: reciboSummary, totalUnidades } = summarizeOrdemForRecibo(ordem);
  const showEtiquetaCol = reciboRows.some((r) => Boolean(r.etiqueta?.trim()));
  const observacoesRecibo = String(ordem.observations ?? "").trim();
  const hasObservacoesRecibo = observacoesRecibo.length > 0;
  const showToolbar = Boolean(onShowOrdersScreen || onPrint);

  const valorAgendamento = Number(
    valorAgendamentoProp ?? ordem.appointment?.value ?? 0,
  );
  const valorAntecipacao = Number(
    valorAntecipacaoProp ?? ordem.appointment?.downPayment ?? 0,
  );
  const subtotalAgendamento = Math.max(valorAgendamento - valorAntecipacao, 0);
  const valorTotalCaixas = sumValorTotalCaixasFromOrdem(ordem);
  const valorVolumesProdutos = sumValorVolumesProdutosOrdem(ordem);
  const valorFrete = sumValorFreteOrdem(ordem);
  const temFrete = valorFrete > 0.005;
  const cashUsd = Number(ordem.cashReceivedUsd ?? 0);
  const zelleUsd = Number(ordem.zelleReceivedUsd ?? 0);
  const totalConsolidado = totalGeralConsolidadoOrdem(ordem);
  const totalRecebidoRegistrado = totalRecebidoPagamentoOrdem(ordem);
  const saldoPendente = saldoPendentePagamentoOrdem(ordem);

  return (
    <div className={`space-y-4 sm:space-y-6 print:bg-white min-w-0 ${className ?? ""}`}>
      <style>{`
        @media print {
          @page { margin: 0mm 10mm 10mm 10mm !important; }
          html, body { height: auto !important; overflow: visible !important; background: white !important; }
          body * { visibility: hidden; }
          #${printElementId}, #${printElementId} * { visibility: visible !important; }
          #${printElementId} {
            position: relative !important; left: auto !important; top: auto !important; transform: none !important;
            width: 100% !important; max-width: 100% !important; margin: 0 auto !important; padding: 0rem 2rem 2rem 2rem !important;
            box-shadow: none !important; border: 2px solid #1e3a5f !important; background: white !important; overflow: visible !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
        }
      `}</style>

      {showToolbar ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 print:hidden">
          {onShowOrdersScreen ? (
            <Button variant="outline" className="w-full sm:w-auto" type="button" onClick={onShowOrdersScreen}>
              {backLabel}
            </Button>
          ) : <span />}
          {onPrint ? (
            <Button type="button" onClick={onPrint} className="bg-[#1E3A5F] w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              {printLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div id={printElementId} className="bg-white border-2 border-[#1E3A5F] rounded-lg p-4 sm:p-8 max-w-3xl mx-auto min-w-0">
        <div className="text-center border-b-2 border-[#1E3A5F] pb-6 mb-6">
          <div className="flex justify-start mb-3">
            <img
              src={itamovingLogo}
              alt="Logo Itamoving"
              className="h-20 w-auto object-contain pointer-events-none select-none"
            />
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#F5A623] to-[#E59400] rounded-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F]">ITAMOVING</h1>
          </div>
          <p className="text-sm text-muted-foreground">Mudanças internacionais EUA–Brasil</p>
          <p className="text-xs text-muted-foreground mt-1">
            {ordem.sender.usaAddress.cidade}, {ordem.sender.usaAddress.estado} - {ordem.recipient.brazilAddress.cidade}, {ordem.recipient.brazilAddress.estado} - {companyContactPhone}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A5F]">RECIBO DE ENTREGA</h2>
            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              CONCLUÍDO
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div><span className="text-muted-foreground">Nº Ordem:</span><span className="font-semibold ml-2">#{ordem.id}</span></div>
            <div>
              <span className="text-muted-foreground">Data:</span>
              <span className="font-semibold ml-2">{format(new Date(ordem.signatureDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2"><User className="w-5 h-5" />Dados do Cliente (Remetente)</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"><span className="text-muted-foreground">Nome:</span><span className="font-semibold">{ordem.sender.usaName}</span></div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"><span className="text-muted-foreground">Telefone:</span><span className="font-semibold">{ordem.sender.usaPhone}</span></div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"><span className="text-muted-foreground">Origem:</span><span className="font-semibold">{ordem.sender.usaAddress.rua} {ordem.sender.usaAddress.numero}, {ordem.sender.usaAddress.cidade} - {ordem.sender.usaAddress.estado}</span></div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"><span className="text-muted-foreground">Destino:</span><span className="font-semibold">{ordem.recipient.brazilAddress.rua}, {ordem.recipient.brazilAddress.cidade} - {ordem.recipient.brazilAddress.estado}</span></div>
          </div>
        </div>

        {hasObservacoesRecibo ? (
          <div className="border border-amber-200 bg-amber-50/60 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Observações da ordem
            </h3>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
              {observacoesRecibo}
            </p>
          </div>
        ) : null}

        <div className="border border-border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2"><Box className="w-5 h-5" />Volumes e produtos entregues</h3>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[280px]">
              <thead className="border-b">
                <tr className="text-center">
                  {showEtiquetaCol ? (
                    <th className="pb-2 pr-2 text-center whitespace-nowrap font-medium">Etiqueta (container)</th>
                  ) : null}
                  <th className="pb-2 pr-2 text-center">Tipo do Produto</th>
                  <th className="pb-2 text-center whitespace-nowrap">Peso (kg)</th>
                  <th className="pb-2 text-center whitespace-nowrap">Valor ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reciboRows.map((row) => (
                  <tr key={row.key}>
                    {showEtiquetaCol ? (
                      <td className="py-2 pr-2 align-top text-center font-mono text-xs whitespace-nowrap">
                        {row.etiqueta?.trim() ? row.etiqueta : "—"}
                      </td>
                    ) : null}
                    <td className="py-2 pr-2 align-top text-center">
                      {row.isFrete ? (
                        <div className="mx-auto max-w-[280px] text-center text-[10px] leading-tight text-muted-foreground">
                          <span className="block text-xs font-semibold text-foreground">
                            {row.tipoPrincipal || "Frete"}
                          </span>
                          {row.freightHasBox ? (
                            <span
                              className="mt-0.5 block truncate"
                              title={[
                                row.freightBoxName?.trim(),
                                row.freightBoxType?.trim(),
                                row.freightBoxLabel?.trim(),
                              ]
                                .filter((s): s is string => Boolean(s))
                                .join(" · ")}
                            >
                              {row.freightBoxName?.trim() || row.freightBoxType?.trim() ? (
                                <>
                                  Caixa: {row.freightBoxName?.trim() || "—"}
                                  {row.freightBoxType?.trim() ? ` (${row.freightBoxType.trim()})` : ""}
                                  {row.freightBoxLabel?.trim() ? ` · ${row.freightBoxLabel.trim()}` : ""}
                                </>
                              ) : row.freightBoxLabel?.trim() ? (
                                <>Etq. {row.freightBoxLabel.trim()}</>
                              ) : (
                                <>—</>
                              )}
                            </span>
                          ) : (
                            <span className="mt-0.5 block opacity-90">Sem caixa na rota</span>
                          )}
                        </div>
                      ) : (
                        <div className="font-medium">
                          {row.quantityLabel ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="font-bold text-[#1E3A5F] tabular-nums">{row.quantityLabel}</span>
                              <span>{row.tipoPrincipal}</span>
                            </span>
                          ) : (
                            row.tipoPrincipal
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2 align-top text-center whitespace-nowrap">{row.weight != null ? Number(row.weight).toFixed(2) : "—"}</td>
                    <td><div className="text-center whitespace-nowrap">{row.value}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            {temFrete ? (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm">
                <div className="flex justify-between gap-4 font-semibold text-emerald-950">
                  <span>Subtotal frete (linhas acima)</span>
                  <span className="tabular-nums">$ {valorFrete.toFixed(2)}</span>
                </div>
              </div>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Quantidade por tipo</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {(Object.keys(RECIBO_CATEGORY_LABEL) as ReciboBoxCategory[]).map((key) => (
                <li key={key} className="flex justify-between gap-4 border-b border-dotted border-border/80 py-1">
                  <span>{RECIBO_CATEGORY_LABEL[key]}</span>
                  <span className="font-semibold tabular-nums">{reciboSummary[key]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-bold text-[#1E3A5F] flex justify-between gap-4 border-t border-[#1E3A5F]/20 pt-2"><span>Total de unidades entregues</span><span className="tabular-nums">{totalUnidades}</span></p>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6 space-y-4">
          <div className="flex items-center gap-2 text-green-900 border-b border-green-200 pb-2">
            <DollarSign className="w-5 h-5 shrink-0" />
            <span className="font-semibold">Pagamento</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Valor do agendamento:</span>
              <span className="font-semibold tabular-nums">$ {valorAgendamento.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Antecipação:</span>
              <span className="font-semibold tabular-nums">- $ {valorAntecipacao.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-green-200">
              <span className="font-semibold text-muted-foreground">Subtotal (agendamento − antecipação):</span>
              <span className="font-bold text-green-800 tabular-nums">$ {subtotalAgendamento.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-green-200">
            {temFrete ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-sm text-muted-foreground">Volumes e produtos (sem frete):</span>
                  <span className="text-lg font-bold text-green-700 tabular-nums">$ {valorVolumesProdutos.toFixed(2)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-sm text-muted-foreground">Frete:</span>
                  <span className="text-lg font-bold text-green-700 tabular-nums">$ {valorFrete.toFixed(2)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 pt-1 border-t border-green-200/80">
                  <span className="text-sm font-semibold text-muted-foreground">Total volumes + frete:</span>
                  <span className="text-xl font-bold text-green-800 tabular-nums">$ {valorTotalCaixas.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-muted-foreground">Valor total dos volumes:</span>
                <span className="text-xl font-bold text-green-700 tabular-nums">$ {valorTotalCaixas.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-green-200 pt-3 space-y-1">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Em espécie (nesta entrega):</span>
              <span className="font-semibold tabular-nums">$ {formatUsdValorRecebidoLivre(cashUsd)}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Zelle (nesta entrega):</span>
              <span className="font-semibold tabular-nums">$ {formatUsdValorRecebidoLivre(zelleUsd)}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm pt-2 border-t border-green-200 font-medium">
              <span className="text-muted-foreground">Total recebido (espécie + Zelle):</span>
              <span className="font-semibold tabular-nums text-green-900">$ {formatUsdValorRecebidoLivre(totalRecebidoRegistrado)}</span>
            </div>
            {saldoPendente > 0.005 ? (
              <div className="flex justify-between gap-4 text-sm rounded-md border border-amber-400 bg-amber-50 px-2 py-2 mt-2">
                <span className="font-semibold text-amber-950">Saldo pendente a pagar:</span>
                <span className="font-bold tabular-nums text-amber-950">$ {formatUsdValorRecebidoLivre(saldoPendente)}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground pt-1">Nesta Ordem de Serviço foi registrado o valor integral da base da ordem acima.</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t-2 border-green-300 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total consolidado
            </p>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal agendamento</span>
              <span className="font-medium tabular-nums">$ {subtotalAgendamento.toFixed(2)}</span>
            </div>
            {temFrete ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">+ Volumes e produtos</span>
                  <span className="font-medium tabular-nums">$ {valorVolumesProdutos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">+ Frete</span>
                  <span className="font-medium tabular-nums">$ {valorFrete.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">+ Total dos volumes</span>
                <span className="font-medium tabular-nums">$ {valorTotalCaixas.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-2 border-t border-green-200">
              <span className="text-base font-bold text-green-900">Total geral (base da ordem)</span>
              <span className="text-xl font-bold text-green-800 tabular-nums">
                $ {totalConsolidado.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-border pt-6">
          <h3 className="font-semibold text-[#1E3A5F] mb-3">Assinatura do Cliente:</h3>
          {ordem.clientSignature ? (
            <div className="border border-border rounded-lg p-4 bg-gray-50">
              <img src={ordem.clientSignature} alt="Assinatura" className="h-24 mx-auto" />
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground mt-4 text-center">Declaro que recebi os itens acima relacionados em perfeito estado.</p>
        </div>

        <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="text-left shrink-0">
              <p className="font-semibold text-[#1E3A5F] text-sm">Motorista</p>
              <p className="mt-0.5 text-foreground font-medium">
                {ordem.driverName?.trim() ? ordem.driverName.trim() : "—"}
              </p>
            </div>
            <div className="text-center sm:text-right flex-1 min-w-0">
              <p>ITAMOVING — Mudanças internacionais</p>
              <p>www.itamoving.com | contato@itamoving.com</p>
              <p className="mt-2">Este documento comprova a entrega e o pagamento dos serviços prestados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

