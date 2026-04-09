import React from "react";
import {
  Activity,
  Calendar,
  Package,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  CalendarCheck,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export function DashboardPrimaryKpiCardsSection({
  clientes,
  clientesNovosUltimaSemana,
  agendamentosHoje,
  agendamentosAmanha,
  agendamentosPendentes,
  hasPermissionFinanceiroRead,
  receitaTotal,
  lucro,
  margemLucro,
  estoque,
  estoqueTotal,
  estoqueBaixoCount,
  estoqueBaixoLength,
  formatCurrency,
}: {
  clientes: number;
  clientesNovosUltimaSemana: number;
  agendamentosHoje: number;
  agendamentosAmanha: number;
  agendamentosPendentes: number;
  hasPermissionFinanceiroRead: boolean;
  receitaTotal: number;
  lucro: number;
  margemLucro: string;
  estoque: {
    smallBoxes: number;
    mediumBoxes: number;
    largeBoxes: number;
    personalizedItems: number;
    adhesiveTape: number;
  };
  estoqueTotal: number;
  estoqueBaixoCount: number;
  estoqueBaixoLength: number;
  formatCurrency: (v: number) => string;
}) {
  // cores/estilo dependem se há estoque baixo
  const estoqueBaixo = estoqueBaixoLength > 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total de Clientes</CardTitle>
            <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">{clientes}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-200 text-blue-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{clientesNovosUltimaSemana} esta semana
              </Badge>
            </div>
            <p className="text-xs text-blue-700 mt-1">Cadastros ativos</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Agendamentos</CardTitle>
            <Calendar className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-900">{agendamentosHoje}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-200 text-green-800">Hoje</Badge>
              <Badge variant="outline" className="text-xs">
                {agendamentosAmanha} amanhã
              </Badge>
            </div>
            <p className="text-xs text-green-700 mt-1">{agendamentosPendentes} pendentes</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {!hasPermissionFinanceiroRead ? (
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-900">Taxa de Conversão</CardTitle>
              <Target className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-900">87.5%</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-indigo-200 text-indigo-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% este mês
                </Badge>
              </div>
              <p className="text-xs text-indigo-700 mt-1">35 de 40 leads convertidos</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Receita Total</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-900 break-words">{formatCurrency(receitaTotal)}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-purple-200 text-purple-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Margem {margemLucro}%
                </Badge>
              </div>
              <p className="text-xs text-purple-700 mt-1">Lucro: {formatCurrency(lucro)}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card
          className={`bg-gradient-to-br border-2 hover:shadow-xl transition-all cursor-pointer group ${
            estoqueBaixo ? "from-orange-50 to-orange-100 border-orange-300" : "from-slate-50 to-slate-100 border-slate-200"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className={`text-sm font-medium ${
                estoqueBaixo ? "text-orange-900" : "text-slate-900"
              }`}
            >
              Estoque Total
            </CardTitle>
            <Package
              className={`h-5 w-5 group-hover:scale-110 transition-transform ${
                estoqueBaixo ? "text-orange-600" : "text-slate-600"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl sm:text-3xl font-bold ${estoqueBaixo ? "text-orange-900" : "text-slate-900"}`}>{estoqueTotal}</div>
            {estoqueBaixo ? (
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-orange-200 text-orange-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {estoqueBaixoCount} item(ns) baixo(s)
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-200 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Níveis normais
                </Badge>
              </div>
            )}
            <p
              className={`text-xs mt-1 break-words ${
                estoqueBaixo ? "text-orange-700" : "text-slate-700"
              }`}
            >
              P: {estoque.smallBoxes} | M: {estoque.mediumBoxes} | G: {estoque.largeBoxes} | Itens Personalizados:{" "}
              {estoque.personalizedItems} | Fitas: {estoque.adhesiveTape}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

