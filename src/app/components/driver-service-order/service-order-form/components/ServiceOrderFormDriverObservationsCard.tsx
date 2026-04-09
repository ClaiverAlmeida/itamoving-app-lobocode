import React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Textarea } from "../../../ui/textarea";

export function ServiceOrderFormDriverObservationsCard({
  observations,
  setObservations,
}: {
  observations: string;
  setObservations: (v: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="bg-gray-50 rounded-t-lg border-0">
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
          <FileText className="w-5 h-5" />
          Observações da ordem de serviço
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        <Textarea
          id="observations"
          placeholder="Digite suas observações aqui"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          className="resize-none h-24 border-2 border-border rounded-lg p-2 bg-white"
        />
      </CardContent>
    </Card>
  );
}

