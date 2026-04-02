import { serviceOrderFormService } from "../../../api";

export const serviceOrderCrud = {
  getAll: () => serviceOrderFormService.getAll(),
  getArchived: () => serviceOrderFormService.getArchived(),
  getById: (id: string, options?: { includeDeleted?: boolean }) =>
    serviceOrderFormService.getById(id, options),
  remove: (id: string) => serviceOrderFormService.delete(id),
  restore: (id: string) => serviceOrderFormService.restore(id),
};

