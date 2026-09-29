import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function IconButton({ className, type = "button", ...props }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-colors",
        "hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
