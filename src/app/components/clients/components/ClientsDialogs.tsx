import React from 'react';
import { Download, Flag, Plus, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { AtendenteSelect } from '../../forms';
import { BRASIL_STATES, EUA_STATES, formatCPF, formatNumberTelephoneBrasil, formatNumberTelephoneEUA } from '../../../utils';
import type { Cliente } from '../../../api';
import type { ClientFormData } from '../hooks/useClientsForm';
import { formatCepBrasil } from '../clients.handlers';

type Props = {
  user: { id: string; nome: string } | null;
  isImportDialogOpen: boolean;
  setIsImportDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  importFile: File | null;
  setImportFile: React.Dispatch<React.SetStateAction<File | null>>;
  onImport: (file: File | null) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  resetForm: () => void;
  editingCliente: Cliente | null;
  onSubmit: (e: React.FormEvent) => void;
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  loadingCep: boolean;
  onCepChange: (cep: string) => void;
};

export function ClientsDialogs({
  user,
  isImportDialogOpen,
  setIsImportDialogOpen,
  importFile,
  setImportFile,
  onImport,
  isDialogOpen,
  setIsDialogOpen,
  resetForm,
  editingCliente,
  onSubmit,
  formData,
  setFormData,
  loadingCep,
  onCepChange,
}: Props) {
  return (
    <>
      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          setIsImportDialogOpen(open);
          if (!open) setImportFile(null);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Clientes</DialogTitle>
          </DialogHeader>
          <DialogDescription>Selecione ou arraste e solte o arquivo para importar os clientes.</DialogDescription>
          <div className="flex flex-col gap-6 w-full py-2">
            <label
              htmlFor="file-import-clientes"
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/40 bg-muted/30 px-8 py-12 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Clique ou arraste o arquivo aqui</span>
              <span className="text-xs text-muted-foreground">Formatos aceitos: .json, .xlsx, .csv</span>
              <Input
                id="file-import-clientes"
                type="file"
                accept=".json,.xlsx,.csv"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setImportFile(f ?? null);
                }}
              />
            </label>
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              {importFile ? (
                <>
                  <span className="min-w-0 flex-1 break-words text-foreground" title={importFile.name}>
                    <strong>Arquivo selecionado:</strong> {importFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={() => {
                      setImportFile(null);
                      const input = document.getElementById('file-import-clientes') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    aria-label="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <span className="text-muted-foreground">Nenhum arquivo selecionado</span>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setIsImportDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button className="w-full sm:w-auto" type="button" onClick={() => onImport(importFile)}>
                Confirmar Importação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg grid grid-cols-1">
          <DialogHeader>
            <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>Preencha os dados do cliente e do destino no Brasil</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                <Flag className="w-5 h-5 text-blue-600" />
                Dados do Cliente (USA)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usaName">Nome Completo (USA) *</Label>
                  <Input
                    id="usaName"
                    value={formData.usaName}
                    onChange={(e) => setFormData({ ...formData, usaName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usaCpf">CPF (USA)</Label>
                  <Input
                    id="usaCpf"
                    value={formData.usaCpf}
                    onChange={(e) => setFormData({ ...formData, usaCpf: formatCPF(e.target.value) })}
                    placeholder="123.456.789-00"
                    maxLength={14}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usaPhone">Telefone (USA) *</Label>
                  <Input
                    id="usaPhone"
                    value={formData.usaPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, usaPhone: formatNumberTelephoneEUA(e.target.value) })
                    }
                    placeholder="+1 (305) 555-0123"
                    required
                  />
                </div>

                <AtendenteSelect
                  user={user ? { id: user.id, nome: user.nome } : null}
                  value={formData.userId}
                  onValueChange={(id) => setFormData({ ...formData, userId: id })}
                  label="Atendente *"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code (USA) *</Label>
                  <Input
                    id="zipCode"
                    value={formData.usaAddress.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usaAddress: { ...formData.usaAddress, zipCode: e.target.value },
                      })
                    }
                    placeholder="33101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruaUSA">Rua (USA) *</Label>
                  <Input
                    id="ruaUSA"
                    value={formData.usaAddress.rua}
                    onChange={(e) =>
                      setFormData({ ...formData, usaAddress: { ...formData.usaAddress, rua: e.target.value } })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroUSA">Número (USA) *</Label>
                  <Input
                    id="numeroUSA"
                    value={formData.usaAddress.numero}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usaAddress: { ...formData.usaAddress, numero: e.target.value },
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complementoUSA">Complemento (USA)</Label>
                  <Input
                    id="complementoUSA"
                    value={formData.usaAddress.complemento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usaAddress: { ...formData.usaAddress, complemento: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidadeUSA">Cidade (USA) *</Label>
                  <Input
                    id="cidadeUSA"
                    value={formData.usaAddress.cidade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usaAddress: { ...formData.usaAddress, cidade: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadoUSA">Estado (USA) *</Label>
                  <Select
                    value={formData.usaAddress.estado || undefined}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        usaAddress: { ...formData.usaAddress, estado: value },
                      })
                    }
                    required
                  >
                    <SelectTrigger id="estadoUSA">
                      <SelectValue placeholder="Selecione o estado dos EUA" />
                    </SelectTrigger>
                    <SelectContent>
                      {EUA_STATES.map(({ uf, nome }) => (
                        <SelectItem key={uf} value={uf}>
                          {uf} – {nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                <Flag className="w-5 h-5 text-green-600" />
                Destinatário no Brasil
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brazilName">Nome Recebedor (Brasil) *</Label>
                  <Input
                    id="brazilName"
                    value={formData.brazilName}
                    onChange={(e) => setFormData({ ...formData, brazilName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brazilCpf">CPF Recebedor (Brasil)</Label>
                  <Input
                    id="brazilCpf"
                    value={formData.brazilCpf}
                    onChange={(e) => setFormData({ ...formData, brazilCpf: formatCPF(e.target.value) })}
                    placeholder="987.654.321-00"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brazilPhone">Telefone (Brasil) *</Label>
                  <Input
                    id="brazilPhone"
                    value={formData.brazilPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, brazilPhone: formatNumberTelephoneBrasil(e.target.value) })
                    }
                    placeholder="+55 11 98765-4321"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP (Brasil) *</Label>
                  <Input
                    id="cep"
                    value={formData.brazilAddress.cep}
                    onChange={(e) => {
                      const formatted = formatCepBrasil(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        brazilAddress: {
                          ...prev.brazilAddress,
                          cep: formatted,
                        },
                      }));
                      if (formatted.replace(/\D/g, '').length === 8) {
                        onCepChange(formatted);
                      }
                    }}
                    placeholder="01234-567"
                    maxLength={9}
                    required
                    disabled={loadingCep}
                  />
                  {loadingCep && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruaBrasil">Rua (Brasil) *</Label>
                  <Input
                    id="ruaBrasil"
                    value={formData.brazilAddress.rua}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brazilAddress: { ...formData.brazilAddress, rua: e.target.value },
                      })
                    }
                    placeholder="Rua das Flores"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroBrasil">Número (Brasil) *</Label>
                  <Input
                    id="numeroBrasil"
                    value={formData.brazilAddress.numero}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brazilAddress: { ...formData.brazilAddress, numero: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complementoBrasil">Complemento (Brasil)</Label>
                  <Input
                    id="complementoBrasil"
                    value={formData.brazilAddress.complemento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brazilAddress: { ...formData.brazilAddress, complemento: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairroBrasil">Bairro (Brasil) *</Label>
                  <Input
                    id="bairroBrasil"
                    value={formData.brazilAddress.bairro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brazilAddress: { ...formData.brazilAddress, bairro: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidadeBrasil">Cidade (Brasil) *</Label>
                  <Input
                    id="cidadeBrasil"
                    value={formData.brazilAddress.cidade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brazilAddress: { ...formData.brazilAddress, cidade: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estadoBrasil">Estado (Brasil) *</Label>
                  <Select
                    value={formData.brazilAddress.estado || undefined}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        brazilAddress: { ...formData.brazilAddress, estado: value },
                      })
                    }
                    required
                  >
                    <SelectTrigger id="estadoBrasil">
                      <SelectValue placeholder="Selecione o estado do Brasil" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRASIL_STATES.map(({ uf, nome }) => (
                        <SelectItem key={uf} value={uf}>
                          {uf} – {nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="cliente-ativo">Cliente ativo</Label>
                  <p className="text-xs text-muted-foreground">O cliente será ativo se o switch estiver ligado.</p>
                </div>
                <Switch
                  id="cliente-ativo"
                  checked={formData.status === 'ACTIVE'}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: checked ? 'ACTIVE' : 'INACTIVE',
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">{editingCliente ? 'Atualizar' : 'Cadastrar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
