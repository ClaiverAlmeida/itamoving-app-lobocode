import type { AppointmentsDataContext } from './appointments/appointments.context';
import type { ClientsDataContext } from './clients/clients.context';
import type { ContainersDataContext } from './containers/containers.context';
import type { DriverServiceOrderDataContext } from './driver-service-order/driver-service-order.context';
import type { FinanceDataContext } from './financial/financial.context';
import type { PricesDataContext } from './prices/prices.context';
import type { StockDataContext } from './stock/stock.context';
import type { UsersDataContext } from './users/users.context';

export type DataContextType =
  & ClientsDataContext
  & StockDataContext
  & AppointmentsDataContext
  & ContainersDataContext
  & FinanceDataContext
  & PricesDataContext
  & UsersDataContext
  & DriverServiceOrderDataContext;
