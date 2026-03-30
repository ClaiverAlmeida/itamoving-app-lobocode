import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import type { Client, FinancialTransaction } from "../../../api";
import { Plus } from "lucide-react";
import type { TransactionFormData } from "../index";
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, METODOS_PAGAMENTO } from "../index";
import { handleNewTransactionSubmit } from "../index";

export function FinancialNewTransactionDialog(props: {
  carregarClientes: () => Promise<Client[]>;
  onCreateTransacao: (t: FinancialTransaction) => void;
}) {
  const { carregarClientes, onCreateTransacao } = props;

  const [clientes, setClientes] = useState<Client[]>([]);

  const initialFormData = useMemo((): TransactionFormData => {
    return {
      clientId: "",
      type: "REVENUE",
      category: "",
      value: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      paymentMethod: "",
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          void carregarClientes().then(setClientes);
        } else {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="col-span-2 w-full sm:w-auto sm:col-span-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) =>
            handleNewTransactionSubmit({
              e,
              formData,
              clientes,
              addTransacao: onCreateTransacao,
              resetForm,
              onClose: () => setOpen(false),
            })
          }
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as TransactionFormData["type"] }))}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REVENUE">Receita</SelectItem>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "REVENUE" && (
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.usaNome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === "REVENUE" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (USD) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodoPagamento">Método de Pagamento *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {METODOS_PAGAMENTO.map((metodo) => (
                    <SelectItem key={metodo} value={metodo}>
                      {metodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

