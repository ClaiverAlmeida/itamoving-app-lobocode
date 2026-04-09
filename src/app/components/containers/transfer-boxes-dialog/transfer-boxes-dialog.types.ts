import type { Container } from "../../../api";

export type TransferBoxCandidate = {
  driverServiceOrderProductId: string;
  /** Ex.: `12-A · PEQUENA` (etiqueta do container + tipo) */
  label: string;
  /** Ex.: ordem / cliente */
  orderContext: string;
  weightKg: number;
};

export type ContainerTransferBoxesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceContainer: Container;
  /** Lista completa; o hook filtra origem e status inadequados. */
  allContainers: Container[];
  candidates: TransferBoxCandidate[];
  initialSelectedIds?: string[];
  onCompleted: (payload: { source: Container; target: Container }) => void | Promise<void>;
};
