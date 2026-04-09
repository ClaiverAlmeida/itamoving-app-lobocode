import { containersServices, serviceOrderFormService } from "../../api";

export const containersCrud = {
  getAll: () => containersServices.getAll(),
  getById: (id: string) => containersServices.getById(id),
  getAllCompletedAndNotAssignedToContainer: () => serviceOrderFormService.getAllCompletedAndNotAssignedToContainer(),
  create: (payload: Parameters<typeof containersServices.create>[0]) =>
    containersServices.create(payload),
  update: (id: string, payload: Parameters<typeof containersServices.update>[1]) =>
    containersServices.update(id, payload),
  delete: (id: string) => containersServices.delete(id),
  assignServiceOrder: (
    id: string,
    payload: Parameters<typeof containersServices.assignServiceOrder>[1],
  ) => containersServices.assignServiceOrder(id, payload),
  unassignServiceOrder: (
    id: string,
    driverServiceOrderId: string,
  ) => containersServices.unassignServiceOrder(id, driverServiceOrderId),
  previewTransferBoxes: (
    id: string,
    payload: Parameters<typeof containersServices.previewTransferBoxes>[1],
  ) => containersServices.previewTransferBoxes(id, payload),
  transferBoxes: (
    id: string,
    payload: Parameters<typeof containersServices.transferBoxes>[1],
  ) => containersServices.transferBoxes(id, payload),
  previewBoxLabels: (payload: Parameters<typeof containersServices.previewBoxLabels>[0]) =>
    containersServices.previewBoxLabels(payload),
};

