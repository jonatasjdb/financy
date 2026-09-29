import { cn } from "@/lib/cn";
import type { CategoryColor } from "@/graphql/types";
import { colorClasses } from "../category-visuals";

export function Tag({ color, label, className }: { color: CategoryColor; label: string; className?: string }) {
  const c = colorClasses(color);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm leading-5 font-medium whitespace-nowrap",
        c.bgLight,
        c.textDark,
        className,
      )}
    >
      {label}
    </span>
  );
}
