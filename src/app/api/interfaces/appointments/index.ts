/** UI model for an appointment (distinct from {@link AppointmentsBackend}). */
export interface Appointment {
  id?: string;
  appointmentPeriodId?: string;
  collectionDate?: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic?: boolean | false;
  qtyBoxes: number;
  observations?: string;
  user: { id: string; name: string };
  client: { id: string; name: string; usaAddress: string };
  status: "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED";
}

export interface CreateAppointmentsPeriodsDTO {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  collectionArea: string;
  status: 'PENDING' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED';
  observations?: string;
}

export interface AppointmentsPeriodsBackend {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  collectionArea: string;
  status: 'PENDING' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED';
  observations?: string;
}

export interface CreateAppointmentsDTO {
  clientId: string;
  appointmentPeriodId?: string;
  collectionDate?: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic?: boolean | false;
  qtyBoxes: number;
  observations?: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED';
}

export interface AppointmentsBackend {
  id: string;
  appointmentPeriodId?: string;
  collectionDate?: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic?: boolean | false;
  qtyBoxes: number;
  observations?: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  user?: { id: string; name: string };
  client: {
    id: string;
    usaName: string;
    usaAddress: {
      rua: string;
      numero: string;
      complemento: string;
      cidade: string;
      estado: string;
      zipCode: string;
    };
  };
}
