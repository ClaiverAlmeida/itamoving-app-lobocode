import { appointmentsService, clientsService, containersServices } from '../../api';
import type {
  CreateAppointmentsDTO,
  CreateAppointmentsPeriodsDTO,
  UpdateAppointmentsDTO,
  UpdateAppointmentsPeriodsDTO,
} from '../../api';

export const appointmentsCrud = {
  getAll: () => appointmentsService.getAll(),
  getAllPeriods: (page: number, limit: number) => appointmentsService.getAllPeriods(page, limit),
  getAllQtdBoxesPerDay: (collectionDate: string, isPeriodic: boolean, appointmentPeriodId: string) =>
    appointmentsService.getAllQtdBoxesPerDay(collectionDate, isPeriodic, appointmentPeriodId),
  getAllQtdBoxesPerPeriod: (startDate: string, endDate: string) =>
    appointmentsService.getAllQtdBoxesPerPeriod(startDate, endDate),
  create: (payload: CreateAppointmentsDTO) => appointmentsService.create(payload),
  update: (id: string, payload: UpdateAppointmentsDTO) => appointmentsService.update(id, payload),
  delete: (id: string) => appointmentsService.delete(id),
  createPeriod: (payload: CreateAppointmentsPeriodsDTO) => appointmentsService.createPeriod(payload),
  updatePeriod: (id: string, payload: UpdateAppointmentsPeriodsDTO) => appointmentsService.updatePeriod(id, payload),
};

export const clientsCrud = {
  getAll: () => clientsService.getAll(),
};

export const containersCrud = {
  getAll: () => containersServices.getAll(),
};