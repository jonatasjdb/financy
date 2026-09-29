import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@apollo/client/react";
import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";
import { CATEGORIES } from "@/graphql/categories";
import { CREATE_TRANSACTION, FINANCE_QUERIES, UPDATE_TRANSACTION } from "@/graphql/transactions";
import type { Transaction, TransactionType } from "@/graphql/types";
import { getErrorMessage } from "@/lib/apollo";
import { formatAmount, toDateInputValue, todayInputValue } from "@/lib/format";
import { cn } from "@/lib/cn";

const schema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().trim().min(1, "Informe a descrição"),
  date: z.string().min(1, "Informe a data"),
  amountInCents: z.number().int().positive("Informe um valor maior que zero"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
});

type FormValues = z.infer<typeof schema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Quando informado, o modal funciona em modo de edição. */
  transaction?: Transaction | null;
}

const emptyValues = (): FormValues => ({
  type: "EXPENSE",
  description: "",
  date: todayInputValue(),
  amountInCents: 0,
  categoryId: "",
});

export function TransactionDialog({ open, onOpenChange, transaction }: TransactionDialogProps) {
  const isEditing = !!transaction;
  const { data } = useQuery(CATEGORIES, { skip: !open });
  const categories = data?.categories ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues() });

  useEffect(() => {
    if (!open) return;
    reset(
      transaction
        ? {
            type: transaction.type,
            description: transaction.description,
            date: toDateInputValue(transaction.date),
            amountInCents: Math.round(transaction.amount * 100),
            categoryId: transaction.category.id,
          }
        : emptyValues(),
    );
  }, [open, transaction, reset]);

  const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: FINANCE_QUERIES,
  });
  const [updateTransaction, { loading: updating }] = useMutation(UPDATE_TRANSACTION, {
    refetchQueries: FINANCE_QUERIES,
  });

  async function onSubmit({ amountInCents, ...values }: FormValues) {
    const input = { ...values, amount: amountInCents / 100 };
    try {
      if (transaction) {
        await updateTransaction({ variables: { id: transaction.id, input } });
        toast.success("Transação atualizada");
      } else {
        await createTransaction({ variables: { input } });
        toast.success("Transação criada");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const type = watch("type");

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar transação" : "Nova transação"}
      description="Registre sua despesa ou receita"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <div className="flex rounded-xl border border-gray-200 p-2" role="radiogroup" aria-label="Tipo">
          <TypeOption
            label="Despesa"
            value="EXPENSE"
            selected={type === "EXPENSE"}
            onSelect={(v) => setValue("type", v)}
          />
          <TypeOption
            label="Receita"
            value="INCOME"
            selected={type === "INCOME"}
            onSelect={(v) => setValue("type", v)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <TextField
            label="Descrição"
            placeholder="Ex. Almoço no restaurante"
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Data"
              type="date"
              error={errors.date?.message}
              {...register("date")}
            />
            <Controller
              control={control}
              name="amountInCents"
              render={({ field }) => (
                <TextField
                  label="Valor"
                  prefix="R$"
                  inputMode="numeric"
                  placeholder="0,00"
                  error={errors.amountInCents?.message}
                  value={field.value ? formatAmount(field.value / 100) : ""}
                  onChange={(e) => field.onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 11)) || 0)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <SelectField
                label="Categoria"
                placeholder={categories.length ? "Selecione" : "Crie uma categoria primeiro"}
                required
                options={categories.map((c) => ({ value: c.id, label: c.title }))}
                error={errors.categoryId?.message}
                {...field}
              />
            )}
          />
        </div>

        <Button type="submit" isLoading={creating || updating}>
          Salvar
        </Button>
      </form>
    </Dialog>
  );
}

function TypeOption({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: TransactionType;
  selected: boolean;
  onSelect(value: TransactionType): void;
}) {
  const isExpense = value === "EXPENSE";
  const Icon = isExpense ? CircleArrowDown : CircleArrowUp;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-1 items-center justify-center gap-3 rounded-lg border px-3 py-[14px] text-base leading-[18px] transition-colors",
        selected
          ? cn("bg-gray-100 font-medium text-gray-800", isExpense ? "border-red-base" : "border-green-base")
          : "border-transparent text-gray-600 hover:bg-gray-100",
      )}
    >
      <Icon
        aria-hidden
        className={cn("size-4", selected ? (isExpense ? "text-red-base" : "text-green-base") : "text-gray-400")}
      />
      {label}
    </button>
  );
}
