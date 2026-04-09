import { usersService } from "../../api";

export const hrCrud = {
  getAll: () => usersService.getAll(),
  create: (payload: Parameters<typeof usersService.create>[0]) => usersService.create(payload),
  update: (id: string, payload: Parameters<typeof usersService.update>[1]) =>
    usersService.update(id, payload),
  delete: (id: string) => usersService.delete(id),
};

