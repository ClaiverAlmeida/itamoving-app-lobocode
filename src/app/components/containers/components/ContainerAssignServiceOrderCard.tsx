import React, { useState } from "react";
import type { Container } from "../../../api";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ClipboardList, Link2 } from "lucide-react";
import { ContainerAssignServiceOrderDialog } from "./ContainerAssignServiceOrderDialog";

type Props = {
  container: Container;
  onAssigned: (updated: Container) => void;
};

export function ContainerAssignServiceOrderCard({ container, onAssigned }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">Ordens de serviço → container</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Você pode vincular <strong className="text-foreground font-medium">mais de uma ordem</strong> ao
                mesmo container. Cada vinculação traz todas as caixas da ordem de uma vez, com etiquetas{" "}
                <span className="font-mono text-xs bg-muted px-1 rounded">1-A</span>,{" "}
                <span className="font-mono text-xs bg-muted px-1 rounded">2-A</span>… em{" "}
                <strong className="text-foreground font-medium">numeração contínua</strong> entre as ordens.
              </CardDescription>
            </div>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 pl-1 border-l-2 border-primary/30 ml-1">
            <li className="pl-3">
              <span className="text-foreground font-medium">Pesos e itens</span> vêm da ordem — não é preciso
              digitar caixa a caixa.
            </li>
            <li className="pl-3">
              {container.volumeLetter ? (
                <>
                  Letra do volume gravada:{" "}
                  <span className="font-mono font-semibold text-foreground">{container.volumeLetter.toUpperCase()}</span>
                  {" "}(definida após a primeira ordem com caixas.)
                </>
              ) : (
                <>
                  A <span className="text-foreground font-medium">identificação alfanumérica</span> (letra +{" "}
                  <span className="font-mono text-xs">1-A</span>, <span className="font-mono text-xs">2-A</span>…) só é
                  gravada no cadastro do container <span className="text-foreground font-medium">depois</span> de
                  vincular uma ordem que tenha caixas; na primeira vez você informa a letra (A–Z).
                </>
              )}
            </li>
            <li className="pl-3">
              Meta típica de ~220 volumes por container (referência operacional); o limite exibido no assistente
              pode ser ajustado no cadastro.
            </li>
          </ul>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t bg-muted/20 px-6 py-4">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            Somente ordens disponíveis na lista do assistente (concluídas e sem outro container).
          </p>
          <Button variant="default" size="sm" className="w-full sm:w-auto shrink-0" onClick={() => setOpen(true)}>
            Abrir assistente
          </Button>
        </CardContent>
      </Card>

      <ContainerAssignServiceOrderDialog
        open={open}
        onOpenChange={setOpen}
        container={container}
        onSuccess={onAssigned}
      />
    </>
  );
}
