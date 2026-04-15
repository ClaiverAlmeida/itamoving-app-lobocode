import * as React from "react";
import { cn } from "./utils";

/** Classe Tailwind padrão (azul) para o traço do ícone; reexporte ao estilizar listas ou temas. */
export const ADHESIVE_TAPE_ICON_CLASS = "text-blue-600";

/**
 * Rolo de fita adesiva (SVG estilo Lucide, `stroke` via `currentColor`).
 * Cor padrão azul; passe `className` para tamanho ou sobrescrever a cor.
 */
export const AdhesiveTapeIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  function AdhesiveTapeIcon({ className, ...props }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(className, ADHESIVE_TAPE_ICON_CLASS)}
        aria-hidden
        {...props}
      >
        <circle cx="9.5" cy="12" r="6" />
        <circle cx="9.5" cy="12" r="2.25" />
        <path d="M15.5 12h5.5" />
        <path d="M21 12v2.75H17.25" />
      </svg>
    );
  },
);
