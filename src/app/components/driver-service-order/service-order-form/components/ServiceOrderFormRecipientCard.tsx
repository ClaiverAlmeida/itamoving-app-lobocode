import React from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

type Props = {
  destinatarioNome: string; setDestinatarioNome: (v: string) => void;
  destinatarioCpfRg: string; setDestinatarioCpfRg: (v: string) => void;
  destinatarioTelefone: string; setDestinatarioTelefone: (v: string) => void;
  destinatarioEndereco: string; setDestinatarioEndereco: (v: string) => void;
  destinatarioBairro: string; setDestinatarioBairro: (v: string) => void;
  destinatarioNumero: string; setDestinatarioNumero: (v: string) => void;
  destinatarioComplemento: string; setDestinatarioComplemento: (v: string) => void;
  destinatarioCidade: string; setDestinatarioCidade: (v: string) => void;
  destinatarioEstado: string; setDestinatarioEstado: (v: string) => void;
  destinatarioCep: string; setDestinatarioCep: (v: string) => void;
};

export function ServiceOrderFormRecipientCard(props: Props) {
  return (
    <Card>
      <CardHeader className="bg-green-50 rounded-t-lg border-0">
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
          <MapPin className="w-5 h-5" />
          Destinatario (Brasil)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label htmlFor="destinatarioNome">Nome *</Label><Input id="destinatarioNome" value={props.destinatarioNome} onChange={(e) => props.setDestinatarioNome(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="destinatarioCpfRg">CPF/RG</Label><Input id="destinatarioCpfRg" value={props.destinatarioCpfRg} onChange={(e) => props.setDestinatarioCpfRg(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="destinatarioTelefone">Telefone *</Label><Input id="destinatarioTelefone" value={props.destinatarioTelefone} onChange={(e) => props.setDestinatarioTelefone(e.target.value)} required /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2"><Label htmlFor="destinatarioEndereco">Endereco *</Label><Input id="destinatarioEndereco" value={props.destinatarioEndereco} onChange={(e) => props.setDestinatarioEndereco(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="destinatarioBairro">Bairro *</Label><Input id="destinatarioBairro" value={props.destinatarioBairro} onChange={(e) => props.setDestinatarioBairro(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="destinatarioNumero">Numero *</Label><Input id="destinatarioNumero" value={props.destinatarioNumero} onChange={(e) => props.setDestinatarioNumero(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="destinatarioComplemento">Complemento</Label><Input id="destinatarioComplemento" value={props.destinatarioComplemento} onChange={(e) => props.setDestinatarioComplemento(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label htmlFor="destinatarioCidade">Cidade *</Label><Input id="destinatarioCidade" value={props.destinatarioCidade} onChange={(e) => props.setDestinatarioCidade(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="destinatarioEstado">Estado *</Label><Input id="destinatarioEstado" value={props.destinatarioEstado} onChange={(e) => props.setDestinatarioEstado(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="destinatarioCep">CEP *</Label><Input id="destinatarioCep" value={props.destinatarioCep} onChange={(e) => props.setDestinatarioCep(e.target.value)} required /></div>
        </div>
      </CardContent>
    </Card>
  );
}

