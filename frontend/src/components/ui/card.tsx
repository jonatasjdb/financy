import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-xl border border-gray-200 bg-white", className)} {...props} />;
}

/** Rótulo em caixa alta usado nos cabeçalhos de cards e tabelas. */
export function Overline({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("text-xs leading-4 font-medium tracking-[0.6px] text-gray-500 uppercase", className)}
      {...props}
    />
  );
}
