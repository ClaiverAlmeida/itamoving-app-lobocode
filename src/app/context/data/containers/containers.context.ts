import { useState } from 'react';
import type { Container } from '../../../api';

export type ContainersDataContext = {
  containers: Container[];
  setContainers: (containers: Container[]) => void;
  addContainer: (container: Container) => void;
  updateContainer: (id: string, container: Partial<Container>) => void;
  deleteContainer: (id: string) => void;
};

export function useContainersDataContext(): ContainersDataContext {
  const [containers, setContainers] = useState<Container[]>([]);

  const addContainer = (container: Container) => {
    setContainers((prev) => [...prev, container]);
  };

  const updateContainer = (id: string, containerUpdate: Partial<Container>) => {
    setContainers((prev) => prev.map((c) => (c.id === id ? { ...c, ...containerUpdate } : c)));
  };

  const deleteContainer = (id: string) => {
    setContainers((prev) => prev.filter((c) => c.id !== id));
  };

  return { containers, setContainers, addContainer, updateContainer, deleteContainer };
}
