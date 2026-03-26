import React from "react";
import { CheckCircle, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

type Props = {
  valorTotalCaixas: number;
  valorPago: string;
  setValorPago: (v: string) => void;
};

export function ServiceOrderFormPaymentCard({ valorTotalCaixas, valorPago, setValorPago }: Props) {
  return (
    <Card className="border-2 border-green-500">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg border-0">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Pagamento em Especie
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <span className="text-sm text-muted-foreground">Valor Total das Caixas:</span>
              <span className="text-2xl font-bold text-green-700">$ {valorTotalCaixas.toFixed(2)}</span>
            </div>
            <div className="border-t border-green-200 pt-4">
              <Label htmlFor="valorPago" className="text-base font-semibold mb-2 block">Valor Recebido em Especie ou Zelle</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  id="valorPago"
                  type="number"
                  placeholder="0.00"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="pl-10 text-lg font-semibold h-12 border-green-300 focus:border-green-500"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {valorPago && parseFloat(valorPago) > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Pagamento Registrado</p>
                <p className="text-xs text-blue-700">$ {parseFloat(valorPago).toFixed(2)} em especie</p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

