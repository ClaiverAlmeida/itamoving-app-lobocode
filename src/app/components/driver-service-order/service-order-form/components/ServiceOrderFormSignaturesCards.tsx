import React from "react";
import { Signature } from "lucide-react";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";

type CanvasEvt = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

type Props = {
  canvasClienteRef: React.RefObject<HTMLCanvasElement | null>;
  canvasAgenteRef: React.RefObject<HTMLCanvasElement | null>;
  startDrawingCliente: (e: CanvasEvt) => void;
  drawCliente: (e: CanvasEvt) => void;
  stopDrawingCliente: () => void;
  limparAssinaturaCliente: () => void;
  startDrawingAgente: (e: CanvasEvt) => void;
  drawAgente: (e: CanvasEvt) => void;
  stopDrawingAgente: () => void;
  limparAssinaturaAgente: () => void;
};

export function ServiceOrderFormSignaturesCards(props: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="bg-purple-50 rounded-t-lg border-0">
          <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
            <Signature className="w-5 h-5" />
            Assinatura Cliente *
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
            <canvas
              ref={props.canvasClienteRef}
              width={400}
              height={150}
              onMouseDown={props.startDrawingCliente}
              onMouseMove={props.drawCliente}
              onMouseUp={props.stopDrawingCliente}
              onMouseLeave={props.stopDrawingCliente}
              onTouchStart={props.startDrawingCliente}
              onTouchMove={props.drawCliente}
              onTouchEnd={props.stopDrawingCliente}
              className="w-full border border-border rounded cursor-crosshair"
            />
          </div>
          <Button variant="outline" onClick={props.limparAssinaturaCliente} className="w-full" size="sm">
            Limpar Assinatura
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-blue-50 rounded-t-lg border-0">
          <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
            <Signature className="w-5 h-5" />
            Assinatura Agente *
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
            <canvas
              ref={props.canvasAgenteRef}
              width={400}
              height={150}
              onMouseDown={props.startDrawingAgente}
              onMouseMove={props.drawAgente}
              onMouseUp={props.stopDrawingAgente}
              onMouseLeave={props.stopDrawingAgente}
              onTouchStart={props.startDrawingAgente}
              onTouchMove={props.drawAgente}
              onTouchEnd={props.stopDrawingAgente}
              className="w-full border border-border rounded cursor-crosshair"
            />
          </div>
          <Button variant="outline" onClick={props.limparAssinaturaAgente} className="w-full" size="sm">
            Limpar Assinatura
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

