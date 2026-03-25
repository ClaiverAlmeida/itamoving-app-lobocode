import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Truck, CheckCircle, User, Box, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { OrdemServicoMotorista } from "../../types";
import {
  RECIBO_CATEGORY_LABEL,
  summarizeOrdemForRecibo,
  type ReciboBoxCategory,
} from "./delivery-receipt-utils";

export const DEFAULT_DELIVERY_RECEIPT_PRINT_ID = "delivery-receipt-print";

export type DeliveryReceiptProps = {
  ordem: OrdemServicoMotorista;
  /** Telefone exibido no cabeçalho (ex.: empresa da sessão). */
  companyContactPhone?: string;
  /** id do nó impresso para CSS @media print; use o mesmo para `window.print()`. */
  printElementId?: string;
  className?: string;
  /** Barra de ações (voltar / imprimir). Se omitido, não renderiza. */
  onShowOrdersScreen?: () => void;
  onPrint?: () => void;
  backLabel?: string;
  printLabel?: string;
};

export function DeliveryReceipt({
  ordem,
  companyContactPhone,
  printElementId = DEFAULT_DELIVERY_RECEIPT_PRINT_ID,
  className,
  onShowOrdersScreen,
  onPrint,
  backLabel = "← Ver Minhas Ordens",
  printLabel = "Imprimir Recibo",
}: DeliveryReceiptProps) {
  const { rows: reciboRows, summary: reciboSummary, totalUnidades } =
    summarizeOrdemForRecibo(ordem);

  const showToolbar = Boolean(onShowOrdersScreen || onPrint);

  return (
    <div className={`space-y-4 sm:space-y-6 print:bg-white min-w-0 ${className ?? ""}`}>
      <style>{`
        @media print {
          @page {
            margin: 10mm;
          }
          html,
          body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          /* Esconder o resto da página; só o recibo (evita PDF em branco com motion/transform/scroll) */
          body * {
            visibility: hidden;
          }
          #${printElementId},
          #${printElementId} * {
            visibility: visible !important;
          }
          #${printElementId} {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 2rem !important;
            box-shadow: none !important;
            border: 2px solid #1e3a5f !important;
            background: white !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {showToolbar ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 print:hidden">
          {onShowOrdersScreen ? (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              type="button"
              onClick={onShowOrdersScreen}
            >
              {backLabel}
            </Button>
          ) : (
            <span />
          )}
          {onPrint ? (
            <Button
              type="button"
              onClick={onPrint}
              className="bg-[#1E3A5F] w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              {printLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* div nativo (não motion): id estável para @media print; motion aplicava transform e gerava PDF em branco */}
      <div
        id={printElementId}
        className="bg-white border-2 border-[#1E3A5F] rounded-lg p-4 sm:p-8 max-w-3xl mx-auto min-w-0"
      >
        <div className="text-center border-b-2 border-[#1E3A5F] pb-6 mb-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#F5A623] to-[#E59400] rounded-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F]">
              ITAMOVING
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Mudanças Internacionais EUA-Brasil
          </p>
          {companyContactPhone ? (
            <p className="text-xs text-muted-foreground mt-1">
              Miami, FL - São Paulo, SP | {companyContactPhone}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Miami, FL - São Paulo, SP
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A5F]">
              RECIBO DE ENTREGA
            </h2>
            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              CONCLUÍDO
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Nº Ordem:</span>
              <span className="font-semibold ml-2">#{ordem.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data:</span>
              <span className="font-semibold ml-2">
                {format(
                  new Date(ordem.signatureDate),
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR },
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados do Cliente (Remetente)
          </h3>
          <div className="grid gap-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-muted-foreground">Nome:</span>
              <span className="font-semibold">{ordem.sender.usaName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-muted-foreground">Telefone:</span>
              <span className="font-semibold">{ordem.sender.usaPhone}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-muted-foreground">Origem:</span>
              <span className="font-semibold">
                {ordem.sender.usaAddress.rua} {ordem.sender.usaAddress.numero},{" "}
                {ordem.sender.usaAddress.cidade} - {ordem.sender.usaAddress.estado}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-muted-foreground">Destino:</span>
              <span className="font-semibold">
                {ordem.recipient.brazilAddress.rua},{" "}
                {ordem.recipient.brazilAddress.cidade} -{" "}
                {ordem.recipient.brazilAddress.estado}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
            <Box className="w-5 h-5" />
            Caixas e produtos entregues
          </h3>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[280px]">
              <thead className="border-b">
                <tr className="text-center">
                  <th className="pb-2 pr-2 text-center">Tipo do Produto</th>
                  <th className="pb-2 text-center whitespace-nowrap">Peso (kg)</th>
                  <th className="pb-2 text-center whitespace-nowrap">Valor (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reciboRows.map((row) => (
                  <tr key={row.key}>
                    <td className="py-2 pr-2 align-top text-center">
                      <div className="font-medium">{row.tipoPrincipal}</div>
                    </td>
                    <td className="py-2 align-top text-center whitespace-nowrap">
                      {row.weight != null
                        ? Number(row.weight).toFixed(2)
                        : "—"}
                    </td>
                    <td>
                      <div className="text-center whitespace-nowrap">{row.value}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Quantidade por tipo
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {(Object.keys(RECIBO_CATEGORY_LABEL) as ReciboBoxCategory[]).map(
                (key) => (
                  <li
                    key={key}
                    className="flex justify-between gap-4 border-b border-dotted border-border/80 py-1"
                  >
                    <span>{RECIBO_CATEGORY_LABEL[key]}</span>
                    <span className="font-semibold tabular-nums">
                      {reciboSummary[key]}
                    </span>
                  </li>
                ),
              )}
            </ul>
            <p className="mt-3 text-sm font-bold text-[#1E3A5F] flex justify-between gap-4 border-t border-[#1E3A5F]/20 pt-2">
              <span>Total de unidades entregues</span>
              <span className="tabular-nums">{totalUnidades}</span>
            </p>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
            <span className="text-base sm:text-lg font-semibold text-green-900">
              Valor Pago em Espécie:
            </span>
            <span className="text-xl sm:text-2xl font-bold text-green-700">
              {ordem.chargedValue
                ? ordem.chargedValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "USD",
                })
                : "$ 0,00"}
            </span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-border pt-6">
          <h3 className="font-semibold text-[#1E3A5F] mb-3">
            Assinatura do Cliente:
          </h3>
          {ordem.clientSignature ? (
            <div className="border border-border rounded-lg p-4 bg-gray-50">
              <img
                src={ordem.clientSignature}
                alt="Assinatura"
                className="h-24 mx-auto"
              />
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Declaro que recebi os itens acima relacionados em perfeito estado.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>ITAMOVING - Mudanças Internacionais</p>
          <p>www.itamoving.com | contato@itamoving.com</p>
          <p className="mt-2">
            Este documento comprova a entrega e pagamento dos serviços prestados.
          </p>
        </div>
      </div>
    </div>
  );
}
