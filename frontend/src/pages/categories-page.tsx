import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ArrowUpDown, Plus, SquarePen, Tag as TagIcon, Trash, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, Overline } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { Tag } from "@/components/ui/tag";
import { CategoryIconBox, colorClasses, getCategoryIcon } from "@/components/category-visuals";
import { CategoryDialog } from "@/features/categories/category-dialog";
import { useDeleteConfirmation } from "@/features/use-delete-confirmation";
import { CATEGORIES, DELETE_CATEGORY } from "@/graphql/categories";
import type { Category } from "@/graphql/types";
import { pluralizeItems } from "@/lib/format";
import { cn } from "@/lib/cn";

export function CategoriesPage() {
  const { data, loading } = useQuery(CATEGORIES);
  const [dialog, setDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const { requestDelete, dialog: deleteDialog } = useDeleteConfirmation(DELETE_CATEGORY, {
    title: "Excluir categoria",
    success: "Categoria excluída",
  });

  const categories = data?.categories ?? [];
  const totalTransactions = categories.reduce((sum, c) => sum + c.transactionsCount, 0);
  const mostUsed = categories.reduce<Category | null>(
    (best, c) => (c.transactionsCount > (best?.transactionsCount ?? 0) ? c : best),
    null,
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categorias"
        subtitle="Organize suas transações por categorias"
        action={
          <Button size="sm" onClick={() => setDialog({ open: true, category: null })}>
            <Plus className="size-4" aria-hidden />
            Nova categoria
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon={TagIcon} iconClass="text-gray-700" value={String(categories.length)} label="Total de categorias" />
        <StatCard icon={ArrowUpDown} iconClass="text-purple-base" value={String(totalTransactions)} label="Total de transações" />
        <StatCard
          icon={mostUsed ? getCategoryIcon(mostUsed.icon) : TagIcon}
          iconClass={mostUsed ? colorClasses(mostUsed.color).textBase : "text-gray-400"}
          value={mostUsed?.title ?? "—"}
          label="Categoria mais utilizada"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id} className="flex flex-col gap-5 p-[25px]">
            <div className="flex items-start justify-between">
              <CategoryIconBox icon={category.icon} color={category.color} />
              <div className="flex gap-2">
                <IconButton
                  aria-label={`Excluir ${category.title}`}
                  onClick={() => requestDelete({ id: category.id, name: category.title })}
                >
                  <Trash className="size-4 text-danger" />
                </IconButton>
                <IconButton aria-label={`Editar ${category.title}`} onClick={() => setDialog({ open: true, category })}>
                  <SquarePen className="size-4" />
                </IconButton>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="truncate text-base leading-6 font-semibold text-gray-800">{category.title}</h2>
              <p className="line-clamp-2 h-10 text-sm leading-5 text-gray-600">{category.description}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Tag color={category.color} label={category.title} />
              <span className="text-sm leading-5 whitespace-nowrap text-gray-600">
                {pluralizeItems(category.transactionsCount)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {!loading && categories.length === 0 && (
        <Card className="px-6 py-12 text-center text-sm text-gray-500">
          Você ainda não tem categorias. Crie a primeira para organizar suas transações.
        </Card>
      )}

      <CategoryDialog
        open={dialog.open}
        category={dialog.category}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
      {deleteDialog}
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconClass,
  value,
  label,
}: {
  icon: LucideIcon;
  iconClass: string;
  value: string;
  label: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-[25px]">
      <span className="flex size-8 shrink-0 items-center justify-center">
        <Icon className={cn("size-6", iconClass)} aria-hidden />
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <strong className="truncate text-[28px] leading-8 font-bold text-gray-800">{value}</strong>
        <Overline>{label}</Overline>
      </div>
    </Card>
  );
}
