import { clientsService } from '../../api';

export const clientsCrud = {
  getAll: () => clientsService.getAll(),
  history: (clientId: string, page: number, limit: number) =>
    clientsService.history(clientId, page, limit),
  create: (payload: Parameters<typeof clientsService.create>[0]) => clientsService.create(payload),
  update: (...args: Parameters<typeof clientsService.update>) => clientsService.update(...args),
  delete: (id: string) => clientsService.delete(id),
  export: () => clientsService.export(),
  import: (file: File) => clientsService.importClients(file),
};
