import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Client } from '../../../api';
import type { AtividadeColorKey, ClienteAtividade, HistoricoPaginado } from '../clients.constants';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Edit, FileText, Flag, MessageCircle, Phone, Trash2, User, X } from 'lucide-react';
import { ClientsHistoryCard } from './ClientsHistoryCard';
import {
  formatBrazilStreetBlock,
  formatBrCityStateCepFooter,
  formatUsaLocationLine,
  joinComma,
  orDash,
} from '../clients.display';

type Props = {
  selectedCliente: Client | null;
  loadingHistoricoId: string | null;
  historicoPorCliente: Record<string, HistoricoPaginado>;
  onClose: () => void;
  onCall: (phones: string[]) => void;
  onWhatsapp: (phones: string[]) => void;
  onEdit: (cliente: Client) => void;
  onDelete: (id: string, nome: string) => void;
  getAtividadeIcon: (a: ClienteAtividade) => any;
  getAtividadeColor: (a: ClienteAtividade) => AtividadeColorKey;
  loadHistoricoPage: (clientId: string, page: number) => void;
};

export function ClientsSidePanel({
  selectedCliente,
  loadingHistoricoId,
  historicoPorCliente,
  onClose,
  onCall,
  onWhatsapp,
  onEdit,
  onDelete,
  getAtividadeIcon,
  getAtividadeColor,
  loadHistoricoPage,
}: Props) {
  return (
    <AnimatePresence>
      {selectedCliente && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed inset-y-0 right-0 w-full lg:w-[600px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-border p-6 z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-blue-500 p-4 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{orDash(selectedCliente.usaName)}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-700">{orDash(selectedCliente.user?.name)}</Badge>
                    <Badge
                      className={
                        selectedCliente.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }
                    >
                      {selectedCliente.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      Cliente desde {new Date(selectedCliente.createdAt).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onCall(selectedCliente.brazilPhone?.trim() ? [selectedCliente.brazilPhone ?? ''] : [])}
              >
                <Phone className="w-4 h-4 mr-2" />
                Ligar
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onWhatsapp(selectedCliente.brazilPhone?.trim() ? [selectedCliente.brazilPhone ?? ''] : [])}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" className="w-full" onClick={() => onEdit(selectedCliente)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Documentos
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CPF (USA)</p>
                  <p className="font-semibold">{orDash(selectedCliente.usaCpf)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Telefone USA</p>
                  <p className="font-semibold">{orDash(selectedCliente.usaPhone)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Telefone Brasil</p>
                  <p className="font-semibold">{orDash(selectedCliente.brazilPhone)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="w-5 h-5 text-blue-600" />
                  Endereço nos Estados Unidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">
                  {joinComma([
                    (selectedCliente.usaAddress as { rua?: string }).rua,
                    (selectedCliente.usaAddress as { numero?: string }).numero,
                    (selectedCliente.usaAddress as { complemento?: string }).complemento,
                  ])}
                </p>
                <p className="text-muted-foreground">
                  {formatUsaLocationLine(
                    selectedCliente.usaAddress as {
                      cidade?: string;
                      estado?: string;
                      zipCode?: string;
                    },
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="w-5 h-5 text-green-600" />
                  Destinatário no Brasil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nome do Recebedor</p>
                  <p className="font-semibold">{orDash(selectedCliente.brazilName)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CPF do Recebedor</p>
                  <p className="font-semibold">{orDash(selectedCliente.brazilCpf)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                  <p className="font-semibold">
                    {formatBrazilStreetBlock(
                      selectedCliente.brazilAddress as {
                        rua?: string;
                        numero?: string;
                        complemento?: string;
                        bairro?: string;
                      },
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {formatBrCityStateCepFooter(
                      selectedCliente.brazilAddress as {
                        cidade?: string;
                        estado?: string;
                        cep?: string;
                      },
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <ClientsHistoryCard
              selectedClienteId={selectedCliente.id}
              loadingHistoricoId={loadingHistoricoId}
              historicoPorCliente={historicoPorCliente}
              getAtividadeIcon={getAtividadeIcon}
              getAtividadeColor={getAtividadeColor}
              loadHistoricoPage={loadHistoricoPage}
            />

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-900">Zona de Perigo</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={() => onDelete(selectedCliente.id, selectedCliente.usaName ?? '')}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Cliente
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
