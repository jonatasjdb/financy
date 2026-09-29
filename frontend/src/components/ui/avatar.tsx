import { getInitials } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-sm leading-5 font-medium text-gray-800",
        className,
      )}
    >
      {getInitials(name) || "?"}
    </span>
  );
}
