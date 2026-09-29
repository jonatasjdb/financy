import { z } from "zod";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../../domain/entities/category";

export const categorySchema = z.object({
  title: z.string().trim().min(1, "Informe o título da categoria").max(40, "Título muito longo"),
  description: z
    .string()
    .trim()
    .max(120, "Descrição muito longa")
    .nullish()
    .transform((value) => (value ? value : null)),
  icon: z.enum(CATEGORY_ICONS, "Ícone inválido"),
  color: z.enum(CATEGORY_COLORS, "Cor inválida"),
});

export type CategoryInput = z.input<typeof categorySchema>;
