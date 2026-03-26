import React from "react";
import type { Container } from "../../../api";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Container as ContainerIcon, Trash2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedContainer: Container | null;
  onDelete: () => void;
};

export function ContainersDeleteDialog({
  isOpen,
  setIsOpen,
  selectedContainer,
  onDelete,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Excluir Container</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este container? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedContainer && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-3 rounded-full">
                    <ContainerIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">{selectedContainer.number}</h3>
                    <p className="text-sm text-red-700">{selectedContainer.origin} {"→"} {selectedContainer.destination}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" className="w-full sm:w-auto" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Container
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

