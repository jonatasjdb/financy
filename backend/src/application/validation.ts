import { z } from "zod";
import { ValidationError } from "../domain/errors/app-error";

/** Valida a entrada de um caso de uso e lança ValidationError com a primeira mensagem. */
export function validate<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? "Dados inválidos");
  }
  return result.data;
}
