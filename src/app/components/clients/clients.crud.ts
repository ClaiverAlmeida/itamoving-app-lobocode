import { clientsService } from '../../api';

export const clientsCrud = {
  getAll: () => clientsService.getAll(),
  history: (clientId: string, page: number, limit: number) =>
    clientsService.history(clientId, page, limit),
  create: clientsService.create,
  update: clientsService.update,
  delete: clientsService.delete,
  export: clientsService.export,
};
