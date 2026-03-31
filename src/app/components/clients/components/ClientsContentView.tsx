import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import type { Client } from '../../../api';
import { Calendar, Edit, FileText, Flag, MapPin, Phone, Trash2, User } from 'lucide-react';
import type { ClientsViewMode } from '../clients.constants';

type Props = {
  viewMode: ClientsViewMode;
  filteredClientes: Client[];
  clientesListRendered: Client[];
  listVisibleCount: number;
  listContainerRef: React.RefObject<HTMLDivElement | null>;
  setListVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  setSelectedCliente: React.Dispatch<React.SetStateAction<Client | null>>;
  onEdit: (cliente: Client) => void;
  onDelete: (id: string, nome: string) => void;
};

export function ClientsContentView({
  viewMode,
  filteredClientes,
  clientesListRendered,
  listVisibleCount,
  listContainerRef,
  setListVisibleCount,
  setSelectedCliente,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      {viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredClientes.map((cliente) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-500 group"
                  onClick={() => setSelectedCliente(cliente)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1 break-words">{cliente.usaName}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {cliente.user?.name ?? '—'}
                            </Badge>
                            <Badge
                              variant={cliente.status === 'ACTIVE' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {cliente.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{cliente.usaPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {(cliente.usaAddress as { cidade?: string; estado?: string }).cidade},{' '}
                        {(cliente.usaAddress as { estado?: string }).estado}{' -> '}
                        {(cliente.brazilAddress as { cidade?: string; estado?: string }).cidade},{' '}
                        {(cliente.brazilAddress as { estado?: string }).estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Cadastrado em {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(cliente);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(cliente.id, cliente.usaName);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredClientes.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>{filteredClientes.length} cliente(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={listContainerRef}
              className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
              onScroll={(e) => {
                const el = e.currentTarget;
                const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 160;
                if (nearBottom && listVisibleCount < filteredClientes.length) {
                  setListVisibleCount((prev) => Math.min(prev + 30, filteredClientes.length));
                }
              }}
            >
              <AnimatePresence>
                {clientesListRendered.map((cliente) => (
                  <motion.div
                    key={cliente.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group"
                  >
                    <Card
                      className="hover:shadow-md transition-all cursor-pointer border-l-4 border-blue-500"
                      onClick={() => setSelectedCliente(cliente)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="bg-blue-100 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-base sm:text-lg break-words">{cliente.usaName}</h3>
                                <Badge variant="outline">{cliente.user?.name ?? '—'}</Badge>
                                <Badge variant={cliente.status === 'ACTIVE' ? 'secondary' : 'destructive'}>
                                  {cliente.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                                <div className="min-w-0">
                                  <p className="text-muted-foreground mb-1">Informações</p>
                                  <p className="flex items-center gap-1 min-w-0">
                                    <FileText className="w-3 h-3 flex-shrink-0" />
                                    <span className="break-all">{cliente.usaCpf}</span>
                                  </p>
                                  <p className="flex items-center gap-1 min-w-0">
                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                    <span className="break-all">{cliente.usaPhone}</span>
                                  </p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-muted-foreground mb-1">Origem (USA)</p>
                                  <p className="flex items-start gap-1">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">
                                      {(cliente.usaAddress as { cidade?: string; estado?: string; zipCode?: string }).cidade},{' '}
                                      {(cliente.usaAddress as { estado?: string }).estado}{' '}
                                      {(cliente.usaAddress as { zipCode?: string }).zipCode}
                                    </span>
                                  </p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-muted-foreground mb-1">Destino (Brasil)</p>
                                  <p className="flex items-start gap-1">
                                    <Flag className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">
                                      {(cliente.brazilAddress as { cidade?: string; estado?: string }).cidade},{' '}
                                      {(cliente.brazilAddress as { estado?: string }).estado}
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">{cliente.brazilName}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 self-end md:self-start">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(cliente);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(cliente.id, cliente.usaName);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {listVisibleCount < filteredClientes.length && (
                <div className="flex justify-center py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setListVisibleCount((prev) => Math.min(prev + 30, filteredClientes.length))}
                  >
                    Carregar mais
                  </Button>
                </div>
              )}

              {filteredClientes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
