import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldWrapper, TextField } from "@/components/ui/field";
import { CATEGORY_COLORS, CATEGORY_ICONS, colorClasses } from "@/components/category-visuals";
import { CREATE_CATEGORY, UPDATE_CATEGORY } from "@/graphql/categories";
import { FINANCE_QUERIES } from "@/graphql/transactions";
import type { Category, CategoryColor } from "@/graphql/types";
import { getErrorMessage } from "@/lib/apollo";
import { cn } from "@/lib/cn";

const schema = z.object({
  title: z.string().trim().min(1, "Informe o título").max(40, "Máximo de 40 caracteres"),
  description: z.string().trim().max(120, "Máximo de 120 caracteres"),
  icon: z.string().min(1, "Selecione um ícone"),
  color: z.enum(CATEGORY_COLORS as [CategoryColor, ...CategoryColor[]]),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = { title: "", description: "", icon: "briefcase-business", color: "green" };

interface CategoryDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  category?: Category | null;
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    reset(
      category
        ? {
            title: category.title,
            description: category.description ?? "",
            icon: category.icon,
            color: category.color,
          }
        : emptyValues,
    );
  }, [open, category, reset]);

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: FINANCE_QUERIES,
  });
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: FINANCE_QUERIES,
  });

  async function onSubmit(values: FormValues) {
    const input = { ...values, description: values.description || null };
    try {
      if (category) {
        await updateCategory({ variables: { id: category.id, input } });
        toast.success("Categoria atualizada");
      } else {
        await createCategory({ variables: { input } });
        toast.success("Categoria criada");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const [selectedIcon, selectedColor] = watch(["icon", "color"]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Editar categoria" : "Nova categoria"}
      description="Organize suas transações com categorias"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-4">
          <TextField label="Título" placeholder="Ex. Alimentação" error={errors.title?.message} {...register("title")} />
          <TextField
            label="Descrição"
            placeholder="Descrição da categoria"
            hint="Opcional"
            error={errors.description?.message}
            {...register("description")}
          />

          <FieldWrapper id="category-icon" label="Ícone" error={errors.icon?.message}>
            <div id="category-icon" role="radiogroup" aria-label="Ícone" className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selectedIcon === key}
                  aria-label={key}
                  onClick={() => setValue("icon", key)}
                  className={cn(
                    "flex size-[42px] items-center justify-center rounded-lg border transition-colors",
                    selectedIcon === key
                      ? "border-brand bg-gray-100 text-gray-800"
                      : "border-gray-300 text-gray-500 hover:bg-gray-100",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </button>
              ))}
            </div>
          </FieldWrapper>

          <FieldWrapper id="category-color" label="Cor">
            <div id="category-color" role="radiogroup" aria-label="Cor" className="flex gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={selectedColor === color}
                  aria-label={color}
                  onClick={() => setValue("color", color)}
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-lg border p-[5px] transition-colors",
                    selectedColor === color ? "border-brand bg-gray-100" : "border-gray-300 hover:bg-gray-100",
                  )}
                >
                  <span className={cn("h-5 w-full rounded", colorClasses(color).bgBase)} />
                </button>
              ))}
            </div>
          </FieldWrapper>
        </div>

        <Button type="submit" isLoading={creating || updating}>
          Salvar
        </Button>
      </form>
    </Dialog>
  );
}
