import React from "react";
import { Button } from "../components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "../components/ui/alert-dialog";

interface UpdateExpirationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isUpdating: boolean;
}

const UpdateExpirationDialog: React.FC<UpdateExpirationDialogProps> = ({ open, onClose, onConfirm, isUpdating }) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Atualizar datas de vencimento</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-2 text-gray-700">
          Deseja atualizar todas as datas de vencimento para esta conta?
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="ml-2" onClick={onConfirm} disabled={isUpdating}>
            {isUpdating ? "Atualizando..." : "Confirmar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdateExpirationDialog;
