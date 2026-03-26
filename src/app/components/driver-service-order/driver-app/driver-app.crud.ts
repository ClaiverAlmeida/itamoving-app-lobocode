import { driverAppService, stockService } from "../../../api";

export const driverAppCrud = {
  getConfirmedAppointments: () => driverAppService.getConfirmedAppointments(),
  getStock: () => stockService.getAll(),
};

