import React from "react";
import { Badge } from "../../ui/badge";
import type { Appointment } from "../../../api";
import { DASHBOARD_APPOINTMENT_STATUS_STYLE_MAP } from "../dashboard.constants";

export function DashboardAppointmentStatusBadge({ status }: { status: Appointment["status"] }) {
  const statusStyle = DASHBOARD_APPOINTMENT_STATUS_STYLE_MAP[status];

  return <Badge className={`${statusStyle.badgeBg} ${statusStyle.badgeText}`}>{statusStyle.label}</Badge>;
}
