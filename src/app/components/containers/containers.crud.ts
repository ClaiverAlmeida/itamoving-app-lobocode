import { containersServices, serviceOrderFormService } from "../../api";

export const containersCrud = {
  getAll: () => containersServices.getAll(),
  getAllCompletedAndNotAssignedToContainer: () => serviceOrderFormService.getAllCompletedAndNotAssignedToContainer(),
  create: (payload: Parameters<typeof containersServices.create>[0]) =>
    containersServices.create(payload),
  update: (id: string, payload: Parameters<typeof containersServices.update>[1]) =>
    containersServices.update(id, payload),
  delete: (id: string) => containersServices.delete(id),
};

