import React from 'react';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAppointmentsDataContext } from './appointments/appointments.context';
import { useClientsDataContext } from './clients/clients.context';
import { useContainersDataContext } from './containers/containers.context';
import { useDriverServiceOrderDataContext } from './driver-service-order/driver-service-order.context';
import { useFinanceDataContext } from './financial/financial.context';
import { usePricesDataContext } from './prices/prices.context';
import { useStockDataContext } from './stock/stock.context';
import { useUsersDataContext } from './users/users.context';
import type { DataContextType } from './types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const clients = useClientsDataContext();
  const stock = useStockDataContext();
  const appointments = useAppointmentsDataContext();
  const containers = useContainersDataContext();
  const finance = useFinanceDataContext();
  const prices = usePricesDataContext();
  const users = useUsersDataContext();
  const driverServiceOrder = useDriverServiceOrderDataContext();

  return (
    <DataContext.Provider
      value={{
        ...clients,
        ...stock,
        ...appointments,
        ...containers,
        ...finance,
        ...prices,
        ...users,
        ...driverServiceOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
