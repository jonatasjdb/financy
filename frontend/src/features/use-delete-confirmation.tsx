import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import type { TypedDocumentNode } from "@apollo/client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FINANCE_QUERIES } from "@/graphql/transactions";
import { getErrorMessage } from "@/lib/apollo";

interface Target {
  id: string;
  name: string;
}

/** Encapsula o fluxo "clicar na lixeira -> confirmar -> executar mutation -> toast". */
export function useDeleteConfirmation<TData>(
  mutation: TypedDocumentNode<TData, { id: string }>,
  texts: { title: string; success: string },
) {
  const [target, setTarget] = useState<Target | null>(null);
  const [mutate, { loading }] = useMutation(mutation, { refetchQueries: FINANCE_QUERIES });

  async function confirm() {
    if (!target) return;
    try {
      await mutate({ variables: { id: target.id } });
      toast.success(texts.success);
      setTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const dialog = (
    <ConfirmDialog
      open={!!target}
      onOpenChange={(open) => !open && setTarget(null)}
      title={texts.title}
      description={`Tem certeza que deseja excluir "${target?.name ?? ""}"?`}
      isLoading={loading}
      onConfirm={confirm}
    />
  );

  return { requestDelete: setTarget, dialog };
}
