import React from "react";
import { Card, CardContent } from "../../../ui/card";

export function ServiceOrderFormCompanyInfoCard({ contactPhone, years }: { contactPhone?: string, years: number }) {
  return (
    <Card className="border-[#F5A623] border-2">
      <CardContent className="pt-4">
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-[#1E3A5F]">☎ {contactPhone} 📱 @itamoving</p>
          <ul className="text-xs space-y-0.5 text-muted-foreground">
            <li>• {years} ANOS TRANSPORTANDO HISTORIAS DOS ESTADOS UNIDOS AO BRASIL</li>
            <li>• LEVAMOS SUA MUDANCA COM TOTAL SEGURANCA</li>
            <li>• TEMOS PASSAGENS AEREAS</li>
            <li>• TRAZEMOS SUA ENCOMENDA DO BRASIL AOS ESTADOS UNIDOS</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

