import { productsService, stockService, usersService } from "../../api";

export const stockCrud = {
  getAll: () => stockService.getAll(),
  update: (...args: Parameters<typeof stockService.update>) => stockService.update(...args),
  getProducts: () => productsService.getAll(),
  getDrivers: () => usersService.getAllDrivers(),
};

