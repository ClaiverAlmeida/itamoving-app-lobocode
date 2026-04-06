import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Client, CreateClientsDTO } from '../../../api';
import { buildCreateClientsPayload } from '../clients-form.utils';

export type ClientFormData = {
  usaName: string;
  usaCpf: string;
  usaPhone: string;
  usaAddress: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
    zipCode: string;
    complemento: string;
  };
  brazilName: string;
  brazilCpf: string;
  brazilPhone: string;
  brazilAddress: {
    rua: string;
    bairro: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento: string;
  };
  userId: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const getInitialFormData = (): ClientFormData => ({
  usaName: '',
  usaCpf: '',
  usaPhone: '',
  usaAddress: {
    rua: '',
    numero: '',
    cidade: '',
    estado: '',
    zipCode: '',
    complemento: '',
  },
  brazilName: '',
  brazilCpf: '',
  brazilPhone: '',
  brazilAddress: {
    rua: '',
    bairro: '',
    numero: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
  },
  userId: '',
  status: 'ACTIVE',
});

export function useClientsForm(args: {
  setEditingCliente: Dispatch<SetStateAction<Client | null>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { setEditingCliente, setIsDialogOpen } = args;
  const [formData, setFormData] = useState<ClientFormData>(getInitialFormData);

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingCliente(null);
  };

  const handleEdit = (cliente: Client) => {
    setEditingCliente(cliente);
    const usaAddr = cliente.usaAddress as {
      rua?: string;
      numero?: string;
      cidade?: string;
      estado?: string;
      zipCode?: string;
      complemento?: string;
    };
    const brAddr = cliente.brazilAddress as {
      rua?: string;
      bairro?: string;
      numero?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      complemento?: string;
    };

    setFormData({
      usaName: cliente.usaName ?? '',
      usaCpf: cliente.usaCpf ?? '',
      usaPhone: cliente.usaPhone ?? '',
      usaAddress: {
        rua: usaAddr?.rua ?? '',
        numero: usaAddr?.numero ?? '',
        cidade: usaAddr?.cidade ?? '',
        estado: usaAddr?.estado ?? '',
        zipCode: usaAddr?.zipCode ?? '',
        complemento: usaAddr?.complemento ?? '',
      },
      brazilName: cliente.brazilName ?? '',
      brazilCpf: cliente.brazilCpf ?? '',
      brazilPhone: cliente.brazilPhone ?? '',
      brazilAddress: {
        rua: brAddr?.rua ?? '',
        bairro: brAddr?.bairro ?? '',
        numero: brAddr?.numero ?? '',
        cidade: brAddr?.cidade ?? '',
        estado: brAddr?.estado ?? '',
        cep: brAddr?.cep ?? '',
        complemento: brAddr?.complemento ?? '',
      },
      userId: cliente.user?.id ?? '',
      status: cliente.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
    });
    setIsDialogOpen(true);
  };

  const getCreatePayload = (): CreateClientsDTO => buildCreateClientsPayload(formData);

  return {
    formData,
    setFormData,
    resetForm,
    handleEdit,
    getCreatePayload,
  };
}
