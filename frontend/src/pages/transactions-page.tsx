import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ChevronLeft, ChevronRight, Plus, Search, SquarePen, Trash } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, Overline } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { SelectField, TextField } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { CategoryIconBox } from "@/components/category-visuals";
import { signedAmount, TransactionTypeLabel } from "@/components/transaction-type-label";
import { TransactionDialog } from "@/features/transactions/transaction-dialog";
import { useDeleteConfirmation } from "@/features/use-delete-confirmation";
import { CATEGORIES } from "@/graphql/categories";
import { DELETE_TRANSACTION, TRANSACTIONS } from "@/graphql/transactions";
import type { Transaction, TransactionFilter, TransactionType } from "@/graphql/types";
import { formatCurrency, formatShortDate, monthLabel } from "@/lib/format";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;
const ALL = "";

/** Mês atual + 11 anteriores, no formato "YYYY-MM". */
function periodOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    return { value: `${d.getFullYear()}-${month}`, label: monthLabel(month, d.getFullYear()) };
  });
}

export function TransactionsPage() {
  const periods = useMemo(periodOptions, []);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TransactionType | "">(ALL);
  const [categoryId, setCategoryId] = useState(ALL);
  const [period, setPeriod] = useState(periods[0].value);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ open: boolean; transaction: Transaction | null }>({
    open: false,
    transaction: null,
  });

  const deferredSearch = useDeferredValue(search.trim());
  const filter = useMemo<TransactionFilter>(() => {
    const [year, month] = period ? period.split("-").map(Number) : [];
    return {
      search: deferredSearch || undefined,
      type: type || undefined,
      categoryId: categoryId || undefined,
      year,
      month,
    };
  }, [deferredSearch, type, categoryId, period]);

  const { data, loading, previousData } = useQuery(TRANSACTIONS, { variables: { filter } });
  const { data: catData } = useQuery(CATEGORIES);
  const { requestDelete, dialog: deleteDialog } = useDeleteConfirmation(DELETE_TRANSACTION, {
    title: "Excluir transação",
    success: "Transação excluída",
  });

  const transactions = (data ?? previousData)?.transactions ?? [];
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const pageItems = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [filter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const from = transactions.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, transactions.length);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Transações"
        subtitle="Gerencie todas as suas transações financeiras"
        action={
          <Button size="sm" onClick={() => setDialog({ open: true, transaction: null })}>
            <Plus className="size-4" aria-hidden />
            Nova transação
          </Button>
        }
      />

      <Card className="grid grid-cols-1 gap-4 px-[25px] pt-[21px] pb-[25px] sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Buscar"
          icon={Search}
          placeholder="Buscar por descrição"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType | "")}
          options={[
            { value: ALL, label: "Todos" },
            { value: "INCOME", label: "Entrada" },
            { value: "EXPENSE", label: "Saída" },
          ]}
        />
        <SelectField
          label="Categoria"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={[
            { value: ALL, label: "Todas" },
            ...(catData?.categories ?? []).map((c) => ({ value: c.id, label: c.title })),
          ]}
        />
        <SelectField
          label="Período"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={[...periods, { value: ALL, label: "Todos os períodos" }]}
        />
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <Th className="text-left">Descrição</Th>
              <Th className="w-28">Data</Th>
              <Th className="w-50">Categoria</Th>
              <Th className="w-34">Tipo</Th>
              <Th className="w-50 text-right">Valor</Th>
              <Th className="w-30 text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((t) => (
              <tr key={t.id} className="h-[72px] border-b border-gray-200">
                <td className="px-6">
                  <div className="flex items-center gap-4">
                    <CategoryIconBox icon={t.category.icon} color={t.category.color} />
                    <span className="text-base leading-6 font-medium text-gray-800">{t.description}</span>
                  </div>
                </td>
                <td className="px-6 text-center text-sm leading-5 whitespace-nowrap text-gray-600">
                  {formatShortDate(t.date)}
                </td>
                <td className="px-6 text-center">
                  <Tag color={t.category.color} label={t.category.title} />
                </td>
                <td className="px-6 text-center">
                  <TransactionTypeLabel type={t.type} />
                </td>
                <td className="px-6 text-right text-sm leading-5 font-semibold whitespace-nowrap text-gray-800">
                  {signedAmount(t.type, formatCurrency(t.amount))}
                </td>
                <td className="px-6">
                  <div className="flex justify-end gap-2">
                    <IconButton
                      aria-label={`Excluir ${t.description}`}
                      onClick={() => requestDelete({ id: t.id, name: t.description })}
                    >
                      <Trash className="size-4 text-danger" />
                    </IconButton>
                    <IconButton
                      aria-label={`Editar ${t.description}`}
                      onClick={() => setDialog({ open: true, transaction: t })}
                    >
                      <SquarePen className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="border-b border-gray-200 px-6 py-12 text-center text-sm text-gray-500">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex min-w-[900px] items-center justify-between px-6 py-5">
          <p className="text-sm leading-5 text-gray-700">
            <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span> |{" "}
            <span className="font-medium">{transactions.length}</span> resultados
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </Card>

      <TransactionDialog
        open={dialog.open}
        transaction={dialog.transaction}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
      {deleteDialog}
    </div>
  );
}

function Th({ className, children }: { className?: string; children: string }) {
  return (
    <th className={cn("px-6 py-5 text-center font-normal", className)}>
      <Overline>{children}</Overline>
    </th>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange(p: number): void }) {
  return (
    <nav className="flex items-center gap-2" aria-label="Paginação">
      <IconButton aria-label="Página anterior" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-4" />
      </IconButton>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
            p === page ? "bg-brand text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
          )}
        >
          {p}
        </button>
      ))}
      <IconButton aria-label="Próxima página" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight className="size-4" />
      </IconButton>
    </nav>
  );
}
