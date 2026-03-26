import { serviceOrderFormService } from "../../../api";

export const serviceOrderCrud = {
  getAll: () => serviceOrderFormService.getAll(),
  getById: (id: string) => serviceOrderFormService.getById(id),
  remove: (id: string) => serviceOrderFormService.delete(id),
};

