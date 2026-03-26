import React from "react";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

type Props = {
  remetenteNome: string;
  setRemetenteNome: (v: string) => void;
  remetenteCpfRg: string;
  setRemetenteCpfRg: (v: string) => void;
  remetenteTel: string;
  setRemetenteTel: (v: string) => void;
  remetenteEndereco: string;
  setRemetenteEndereco: (v: string) => void;
  remetenteNumero: string;
  setRemetenteNumero: (v: string) => void;
  remetenteComplemento: string;
  setRemetenteComplemento: (v: string) => void;
  remetenteCidade: string;
  setRemetenteCidade: (v: string) => void;
  remetenteEstado: string;
  setRemetenteEstado: (v: string) => void;
  remetenteZipCode: string;
  setRemetenteZipCode: (v: string) => void;
};

export function ServiceOrderFormSenderCard(props: Props) {
  return (
    <Card>
      <CardHeader className="bg-blue-50 rounded-t-lg border-0">
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
          <User className="w-5 h-5" />
          Remetente (USA)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label htmlFor="remetenteNome">Nome *</Label><Input id="remetenteNome" value={props.remetenteNome} onChange={(e) => props.setRemetenteNome(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="remetenteCpfRg">CPF/RG</Label><Input id="remetenteCpfRg" value={props.remetenteCpfRg} onChange={(e) => props.setRemetenteCpfRg(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="remetenteTel">Telefone *</Label><Input id="remetenteTel" value={props.remetenteTel} onChange={(e) => props.setRemetenteTel(e.target.value)} required /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label htmlFor="remetenteEndereco">Endereco *</Label><Input id="remetenteEndereco" value={props.remetenteEndereco} onChange={(e) => props.setRemetenteEndereco(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="remetenteNumero">Numero *</Label><Input id="remetenteNumero" value={props.remetenteNumero} onChange={(e) => props.setRemetenteNumero(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="remetenteComplemento">Complemento</Label><Input id="remetenteComplemento" value={props.remetenteComplemento} onChange={(e) => props.setRemetenteComplemento(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label htmlFor="remetenteCidade">Cidade *</Label><Input id="remetenteCidade" value={props.remetenteCidade} onChange={(e) => props.setRemetenteCidade(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="remetenteEstado">Estado *</Label><Input id="remetenteEstado" value={props.remetenteEstado} onChange={(e) => props.setRemetenteEstado(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="remetenteZipCode">ZIP Code *</Label><Input id="remetenteZipCode" value={props.remetenteZipCode} onChange={(e) => props.setRemetenteZipCode(e.target.value)} required /></div>
        </div>
      </CardContent>
    </Card>
  );
}

