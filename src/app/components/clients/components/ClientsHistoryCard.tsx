import React from 'react';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  ATIVIDADE_COLOR_CLASSES,
  type AtividadeColorKey,
  type ClienteAtividade,
  type HistoricoPaginado,
} from '../clients.constants';
import { getAppTimeZone } from '../../../utils';

type Props = {
  selectedClienteId: string;
  loadingHistoricoId: string | null;
  historicoPorCliente: Record<string, HistoricoPaginado>;
  getAtividadeIcon: (a: ClienteAtividade) => any;
  getAtividadeColor: (a: ClienteAtividade) => AtividadeColorKey;
  loadHistoricoPage: (clientId: string, page: number) => void;
};

export function ClientsHistoryCard({
  selectedClienteId,
  loadingHistoricoId,
  historicoPorCliente,
  getAtividadeIcon,
  getAtividadeColor,
  loadHistoricoPage,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Histórico de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loadingHistoricoId === selectedClienteId ? (
            <p className="text-sm text-muted-foreground">Carregando histórico...</p>
          ) : !historicoPorCliente[selectedClienteId] ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
          ) : historicoPorCliente[selectedClienteId].items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
          ) : (
            <>
              {historicoPorCliente[selectedClienteId].items.map((atividade) => {
                const Icon = getAtividadeIcon(atividade);
                const colorKey = getAtividadeColor(atividade);
                const colorStyles = ATIVIDADE_COLOR_CLASSES[colorKey] ?? ATIVIDADE_COLOR_CLASSES.orange;
                return (
                  <div key={atividade.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full flex-shrink-0 ${colorStyles.bg}`}>
                      <Icon className={`w-4 h-4 ${colorStyles.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="font-semibold text-sm">{atividade.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {atividade.data.toLocaleDateString('pt-BR', {
                          timeZone: getAppTimeZone(),
                        })}{' '}
                        às{' '}
                        {atividade.data.toLocaleTimeString('pt-BR', {
                          timeZone: getAppTimeZone(),
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {atividade.tipo === 'atualizacao'
                          ? 'Editado'
                          : atividade.tipo === 'cadastro'
                            ? 'Cadastrado'
                            : atividade.tipo === 'exclusao'
                              ? 'Excluído'
                              : atividade.tipo === 'agendamento'
                                ? 'Agendado'
                                : 'Atualizado'}{' '}
                        por: {atividade.owner.name}
                      </p>
                    </div>
                  </div>
                );
              })}
              {historicoPorCliente[selectedClienteId].totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={
                      loadingHistoricoId === selectedClienteId || historicoPorCliente[selectedClienteId].page <= 1
                    }
                    onClick={() =>
                      loadHistoricoPage(selectedClienteId, historicoPorCliente[selectedClienteId].page - 1)
                    }
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground text-center">
                    Página {historicoPorCliente[selectedClienteId].page} de{' '}
                    {historicoPorCliente[selectedClienteId].totalPages} (
                    {historicoPorCliente[selectedClienteId].total} atividades)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={
                      loadingHistoricoId === selectedClienteId ||
                      historicoPorCliente[selectedClienteId].page >=
                        historicoPorCliente[selectedClienteId].totalPages
                    }
                    onClick={() =>
                      loadHistoricoPage(selectedClienteId, historicoPorCliente[selectedClienteId].page + 1)
                    }
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
