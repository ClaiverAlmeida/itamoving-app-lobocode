import { productsService, serviceOrderFormService, usersService } from "../../../api";
import type { OrdemServicoMotorista } from "../../../api";

export const serviceOrderFormCrud = {
  getDrivers: () => usersService.getAllDrivers(),
  getProducts: (opts?: {
    includeDeletedForEdit?: boolean;
    driverServiceOrderId?: string;
  }) =>
    opts?.includeDeletedForEdit
      ? productsService.getAllForServiceOrderEdit(opts.driverServiceOrderId)
      : productsService.getAll(),
  create: (payload: OrdemServicoMotorista) => serviceOrderFormService.create(payload),
  update: (id: string, payload: Partial<OrdemServicoMotorista>) => serviceOrderFormService.update(id, payload),
};

