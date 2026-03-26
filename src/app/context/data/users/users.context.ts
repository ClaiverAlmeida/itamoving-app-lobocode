import { useState } from 'react';
import type { Usuario } from '../../../api';

export type UsersDataContext = {
  usuarios: Usuario[];
  setUsuarios: (usuarios: Usuario[]) => void;
  addUsuario: (usuario: Usuario) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
};

export function useUsersDataContext(): UsersDataContext {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const addUsuario = (usuario: Usuario) => {
    setUsuarios((prev) => [...prev, usuario]);
  };

  const updateUsuario = (id: string, usuarioUpdate: Partial<Usuario>) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...usuarioUpdate } : u)));
  };

  const deleteUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  return { usuarios, setUsuarios, addUsuario, updateUsuario, deleteUsuario };
}
