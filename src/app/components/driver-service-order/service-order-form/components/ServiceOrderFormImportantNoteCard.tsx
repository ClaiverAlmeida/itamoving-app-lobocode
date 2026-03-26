import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../../ui/card";

export function ServiceOrderFormImportantNoteCard() {
  return (
    <Card className="border-yellow-300 bg-yellow-50">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-900">
            <p className="font-semibold mb-1">Informacao Importante:</p>
            <p>
              TEMPO PARA ENTREGA: 3 A 4 MESES DEPOIS QUE O CONTAINER SAI DOS EUA E NAO DA DATA QUE E RECOLHIDO NA CASA DO CLIENTE.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

