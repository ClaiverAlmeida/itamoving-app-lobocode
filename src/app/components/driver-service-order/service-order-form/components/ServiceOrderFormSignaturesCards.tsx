import React, { useEffect, useState } from "react";
import { Signature } from "lucide-react";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { loadDataUrlOnCanvas } from "../service-order-form.utils";

type CanvasEvt = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

type Props = {
  canvasClienteRef: React.RefObject<HTMLCanvasElement | null>;
  canvasAgenteRef: React.RefObject<HTMLCanvasElement | null>;
  assinaturaCliente: string;
  assinaturaAgente: string;
  startDrawingCliente: (e: CanvasEvt) => void;
  drawCliente: (e: CanvasEvt) => void;
  stopDrawingCliente: () => void;
  limparAssinaturaCliente: () => void;
  startDrawingAgente: (e: CanvasEvt) => void;
  drawAgente: (e: CanvasEvt) => void;
  stopDrawingAgente: () => void;
  limparAssinaturaAgente: () => void;
};

const CANVAS_W = 400;
const CANVAS_H = 150;

/**
 * `userAgent` não depende da largura do ecrã (telemóveis largos, landscape, dobráveis).
 * Cobre Android/iOS/WebView, Samsung, UC, Silk/Kindle, etc.; `userAgentData.mobile` quando existe.
 * iPad em modo “desktop” no Safari costuma vir como Macintosh + toque — tratado à parte.
 */
const MOBILE_USER_AGENT_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|CriOS|FxiOS|EdgA|EdgiOS|SamsungBrowser|UCBrowser|Mobile\/|Mobile\s|;\s\w+\sBuild\/|\bTablet\b|Silk\/|Kindle|wv\)|.*Version\/.*Mobile\/|OPR\/[\d.]+.*Mobile/i;

function isMobileSignatureClient(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (MOBILE_USER_AGENT_RE.test(ua)) return true;
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (uaData?.mobile === true) return true;
  if (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) return true;
  return false;
}

function useIsMobileSignatureViewport() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(isMobileSignatureClient());
  }, []);
  return isMobile;
}

export function ServiceOrderFormSignaturesCards(props: Props) {
  const isMobile = useIsMobileSignatureViewport();
  const [openCliente, setOpenCliente] = useState(false);
  const [openAgente, setOpenAgente] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setOpenCliente(false);
      setOpenAgente(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !openCliente) return;
    const id = requestAnimationFrame(() => {
      loadDataUrlOnCanvas(props.assinaturaCliente, props.canvasClienteRef);
    });
    return () => cancelAnimationFrame(id);
  }, [isMobile, openCliente, props.assinaturaCliente, props.canvasClienteRef]);

  useEffect(() => {
    if (!isMobile || !openAgente) return;
    const id = requestAnimationFrame(() => {
      loadDataUrlOnCanvas(props.assinaturaAgente, props.canvasAgenteRef);
    });
    return () => cancelAnimationFrame(id);
  }, [isMobile, openAgente, props.assinaturaAgente, props.canvasAgenteRef]);

  const closeCliente = (open: boolean) => {
    if (!open) {
      props.stopDrawingCliente();
    }
    setOpenCliente(open);
  };

  const closeAgente = (open: boolean) => {
    if (!open) {
      props.stopDrawingAgente();
    }
    setOpenAgente(open);
  };

  const canvasClienteHandlers = {
    onMouseDown: props.startDrawingCliente,
    onMouseMove: props.drawCliente,
    onMouseUp: props.stopDrawingCliente,
    onMouseLeave: props.stopDrawingCliente,
    onTouchStart: props.startDrawingCliente,
    onTouchMove: props.drawCliente,
    onTouchEnd: props.stopDrawingCliente,
  };

  const canvasAgenteHandlers = {
    onMouseDown: props.startDrawingAgente,
    onMouseMove: props.drawAgente,
    onMouseUp: props.stopDrawingAgente,
    onMouseLeave: props.stopDrawingAgente,
    onTouchStart: props.startDrawingAgente,
    onTouchMove: props.drawAgente,
    onTouchEnd: props.stopDrawingAgente,
  };

  const canvasClass =
    "w-full max-w-[400px] border border-border rounded cursor-crosshair touch-none select-none mx-auto block";

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
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setOpenCliente(true)}
                className="w-full rounded-lg border-2 border-dashed border-border bg-white p-3 text-left transition hover:bg-muted/40 min-h-[120px] flex flex-col items-center justify-center gap-2"
              >
                {props.assinaturaCliente.trim() ? (
                  <img
                    src={props.assinaturaCliente}
                    alt="Pré-visualização da assinatura do cliente"
                    className="max-h-28 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Toque para assinar com o dedo</span>
                )}
              </button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  className="flex-1"
                  size="sm"
                  onClick={() => setOpenCliente(true)}
                >
                  {props.assinaturaCliente.trim() ? "Editar assinatura" : "Assinar"}
                </Button>
                <Button variant="outline" onClick={props.limparAssinaturaCliente} className="flex-1" size="sm">
                  Limpar
                </Button>
              </div>

              <Dialog open={openCliente} onOpenChange={closeCliente}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0 gap-0">
                  <div className="p-6 pb-2">
                    <DialogHeader>
                      <DialogTitle>Assinatura do cliente</DialogTitle>
                      <DialogDescription>
                        Desenhe no quadro abaixo. O fundo da página fica fixo para não rolar durante o traço.
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="border-y bg-muted/20 px-4 py-4">
                    <canvas
                      ref={props.canvasClienteRef}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      {...canvasClienteHandlers}
                      className={canvasClass}
                    />
                  </div>
                  <div className="p-6 pt-4">
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={props.limparAssinaturaCliente} className="w-full sm:w-auto">
                        Limpar
                      </Button>
                      <Button
                        type="button"
                        className="w-full sm:w-auto bg-[#1E3A5F]"
                        onClick={() => {
                          props.stopDrawingCliente();
                          setOpenCliente(false);
                        }}
                      >
                        Concluir
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
                <canvas
                  ref={props.canvasClienteRef}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  {...canvasClienteHandlers}
                  className={`${canvasClass} w-full`}
                />
              </div>
              <Button variant="outline" onClick={props.limparAssinaturaCliente} className="w-full" size="sm">
                Limpar Assinatura
              </Button>
            </>
          )}
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
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setOpenAgente(true)}
                className="w-full rounded-lg border-2 border-dashed border-border bg-white p-3 text-left transition hover:bg-muted/40 min-h-[120px] flex flex-col items-center justify-center gap-2"
              >
                {props.assinaturaAgente.trim() ? (
                  <img
                    src={props.assinaturaAgente}
                    alt="Pré-visualização da assinatura do agente"
                    className="max-h-28 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Toque para assinar com o dedo</span>
                )}
              </button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  className="flex-1"
                  size="sm"
                  onClick={() => setOpenAgente(true)}
                >
                  {props.assinaturaAgente.trim() ? "Editar assinatura" : "Assinar"}
                </Button>
                <Button variant="outline" onClick={props.limparAssinaturaAgente} className="flex-1" size="sm">
                  Limpar
                </Button>
              </div>

              <Dialog open={openAgente} onOpenChange={closeAgente}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0 gap-0">
                  <div className="p-6 pb-2">
                    <DialogHeader>
                      <DialogTitle>Assinatura do agente</DialogTitle>
                      <DialogDescription>
                        Desenhe no quadro abaixo. O fundo da página fica fixo para não rolar durante o traço.
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="border-y bg-muted/20 px-4 py-4">
                    <canvas
                      ref={props.canvasAgenteRef}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      {...canvasAgenteHandlers}
                      className={canvasClass}
                    />
                  </div>
                  <div className="p-6 pt-4">
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={props.limparAssinaturaAgente} className="w-full sm:w-auto">
                        Limpar
                      </Button>
                      <Button
                        type="button"
                        className="w-full sm:w-auto bg-[#1E3A5F]"
                        onClick={() => {
                          props.stopDrawingAgente();
                          setOpenAgente(false);
                        }}
                      >
                        Concluir
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
                <canvas
                  ref={props.canvasAgenteRef}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  {...canvasAgenteHandlers}
                  className={`${canvasClass} w-full`}
                />
              </div>
              <Button variant="outline" onClick={props.limparAssinaturaAgente} className="w-full" size="sm">
                Limpar Assinatura
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
