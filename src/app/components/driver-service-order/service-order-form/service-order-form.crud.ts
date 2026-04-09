import { productsService, serviceOrderFormService, usersService } from "../../../api";
import type { DriverServiceOrder } from "../../../api";
import { containersCrud } from "../../containers/containers.crud";

export const serviceOrderFormCrud = {
  getDrivers: () => usersService.getAllDrivers(),
  getContainers: () => containersCrud.getAll(),
  getProducts: (opts?: {
    includeDeletedForEdit?: boolean;
    driverServiceOrderId?: string;
  }) =>
    opts?.includeDeletedForEdit
      ? productsService.getAllForServiceOrderEdit(opts.driverServiceOrderId)
      : productsService.getAll(),
  create: (payload: DriverServiceOrder) => serviceOrderFormService.create(payload),
  update: (id: string, payload: Partial<DriverServiceOrder>) => serviceOrderFormService.update(id, payload),
};

