import React from "react";
import { viewFieldClass } from "../service-order.utils";

export function ViewField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={viewFieldClass(className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1.5 break-words text-sm leading-snug text-foreground">{children}</div>
    </div>
  );
}

