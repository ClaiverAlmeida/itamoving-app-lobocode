import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cn } from "../../ui/utils";
import type { DriverServiceOrder, DriverServiceOrderView } from "../../../api";

export type AgendamentoResumo = {
  companyName: string;
  collectionDate: string;
  collectionTime: string;
  companyAddress: string;
  companyPhone?: string;
  isPeriodic: boolean;
};

export function formatUsd(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "USD" });
}

export function formatDateTime(iso: string) {
  try {
    return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function formatCollectionDate(dateStr: string | undefined) {
  if (!dateStr) return "—";
  const prefix = dateStr.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(prefix);
  if (m) {
    const localDate = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return format(localDate, "dd/MM/yyyy", { locale: ptBR });
  }
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
}

export function agendamentoFromOrdem(ordem: DriverServiceOrderView) {
  const apt = ordem.appointment;
  const comp = ordem.company;
  return {
    id: ordem.appointmentId,
    status: "CONFIRMED",
    isPeriodic: apt?.isPeriodic ?? false,
    collectionDate: apt?.collectionDate ?? "",
    collectionTime: apt?.collectionTime ?? "",
    /** Valor e antecipação do agendamento (GET da ordem inclui `appointment`). */
    value: apt?.value ?? 0,
    downPayment: apt?.downPayment ?? 0,
    client: {
      usaName: ordem.sender.usaName,
      usaPhone: ordem.sender.usaPhone,
      usaCpf: ordem.sender.usaCpf,
      usaAddress: {
        rua: ordem.sender.usaAddress.rua,
        numero: ordem.sender.usaAddress.numero,
        cidade: ordem.sender.usaAddress.cidade,
        estado: ordem.sender.usaAddress.estado,
        zipCode: ordem.sender.usaAddress.zipCode,
        complemento: ordem.sender.usaAddress.complemento ?? "",
      },
      brazilName: ordem.recipient.brazilName,
      brazilCpf: ordem.recipient.brazilCpf,
      brazilPhone: ordem.recipient.brazilPhone,
      brazilAddress: {
        rua: ordem.recipient.brazilAddress.rua,
        bairro: ordem.recipient.brazilAddress.bairro,
        cidade: ordem.recipient.brazilAddress.cidade,
        estado: ordem.recipient.brazilAddress.estado,
        cep: ordem.recipient.brazilAddress.cep,
        numero: ordem.recipient.brazilAddress.numero ?? "",
        complemento: ordem.recipient.brazilAddress.complemento ?? "",
      },
    },
    company: {
      address: comp?.address ?? comp?.name ?? "—",
      contactPhone: comp?.contactPhone ?? "—",
    },
    containerId: ordem.containerId ?? ordem.container?.id ?? undefined,
    container: ordem.container
      ? {
          id: String(ordem.container.id ?? ""),
          number: ordem.container.number,
          type: ordem.container.type,
        }
      : undefined,
  };
}

export function agendamentoResumoParaExibicao(ordem: DriverServiceOrderView): AgendamentoResumo | null {
  const apt = ordem.appointment;
  const comp = ordem.company;
  if (!apt && !comp) return null;
  return {
    companyName: comp?.name ?? "—",
    collectionDate: apt?.collectionDate ?? "",
    collectionTime: apt?.collectionTime ?? "",
    companyAddress: comp?.address ?? "—",
    companyPhone: comp?.contactPhone,
    isPeriodic: Boolean(apt?.isPeriodic),
  };
}

export function statusBadgeClass(status: DriverServiceOrder["status"]) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-900 border-emerald-200/80";
  if (status === "IN_PROGRESS") return "bg-amber-50 text-amber-900 border-amber-200/80";
  return "bg-slate-100 text-slate-800 border-slate-200/80";
}

export function viewFieldClass(className?: string) {
  return cn("min-w-0", className);
}

