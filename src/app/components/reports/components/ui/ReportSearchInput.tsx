import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../ui/input";
import { cn } from "../../../ui/utils";

export function ReportSearchInput(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
}) {
  const {
    value,
    onChange,
    placeholder = "Digite para buscar...",
    id,
    className,
    inputClassName,
    "aria-label": ariaLabel,
  } = props;

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("pl-10", inputClassName)}
        aria-label={ariaLabel}
      />
    </div>
  );
}
