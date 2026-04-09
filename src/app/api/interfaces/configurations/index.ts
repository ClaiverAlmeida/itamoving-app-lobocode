export interface Company {
  name: string;
  website: string;
  address: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface CompanyBackend {
  id: string;
  name: string;
  website: string;
  address: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  deletedA?: string;
}
