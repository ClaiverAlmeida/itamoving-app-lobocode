import React from "react";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { cn } from "../../../ui/utils";

export function ReportDateInput(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { id, label, value, onChange, className } = props;

  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
