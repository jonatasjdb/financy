import {
  BaggageClaim,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Tag as TagIcon,
  Ticket,
  ToolCase,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { CategoryColor } from "@/graphql/types";
import { cn } from "@/lib/cn";

/** Ícones disponíveis para categorias (mesma ordem do modal no Figma). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "briefcase-business": BriefcaseBusiness,
  "car-front": CarFront,
  "heart-pulse": HeartPulse,
  "piggy-bank": PiggyBank,
  "shopping-cart": ShoppingCart,
  ticket: Ticket,
  "tool-case": ToolCase,
  utensils: Utensils,
  "paw-print": PawPrint,
  house: House,
  gift: Gift,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  "baggage-claim": BaggageClaim,
  mailbox: Mailbox,
  "receipt-text": ReceiptText,
};

export const CATEGORY_COLORS: CategoryColor[] = ["green", "blue", "purple", "pink", "red", "orange", "yellow"];

// Classes estáticas (o Tailwind precisa encontrá-las literalmente no código).
const COLOR_CLASSES: Record<CategoryColor, { bgBase: string; bgLight: string; textBase: string; textDark: string }> = {
  green: { bgBase: "bg-green-base", bgLight: "bg-green-light", textBase: "text-green-base", textDark: "text-green-dark" },
  blue: { bgBase: "bg-blue-base", bgLight: "bg-blue-light", textBase: "text-blue-base", textDark: "text-blue-dark" },
  purple: { bgBase: "bg-purple-base", bgLight: "bg-purple-light", textBase: "text-purple-base", textDark: "text-purple-dark" },
  pink: { bgBase: "bg-pink-base", bgLight: "bg-pink-light", textBase: "text-pink-base", textDark: "text-pink-dark" },
  red: { bgBase: "bg-red-base", bgLight: "bg-red-light", textBase: "text-red-base", textDark: "text-red-dark" },
  orange: { bgBase: "bg-orange-base", bgLight: "bg-orange-light", textBase: "text-orange-base", textDark: "text-orange-dark" },
  yellow: { bgBase: "bg-yellow-base", bgLight: "bg-yellow-light", textBase: "text-yellow-base", textDark: "text-yellow-dark" },
};

export function colorClasses(color: string) {
  return COLOR_CLASSES[color as CategoryColor] ?? COLOR_CLASSES.blue;
}

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? TagIcon;
}

/** Quadrado 40x40 com fundo claro e ícone na cor base da categoria. */
export function CategoryIconBox({ icon, color, className }: { icon: string; color: string; className?: string }) {
  const Icon = getCategoryIcon(icon);
  const c = colorClasses(color);
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", c.bgLight, className)}>
      <Icon className={cn("size-4", c.textBase)} aria-hidden />
    </span>
  );
}
