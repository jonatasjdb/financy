import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { ChevronRight, CircleArrowDown, CircleArrowUp, Plus, Wallet, type LucideIcon } from "lucide-react";
import { Card, Overline } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { CategoryIconBox } from "@/components/category-visuals";
import { signedAmount } from "@/components/transaction-type-label";
import { TransactionDialog } from "@/features/transactions/transaction-dialog";
import { SUMMARY, TRANSACTIONS } from "@/graphql/transactions";
import { CATEGORIES } from "@/graphql/categories";
import { formatCurrency, formatShortDate, pluralizeItems } from "@/lib/format";
import { cn } from "@/lib/cn";

const now = new Date();

export function DashboardPage() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { data: summaryData } = useQuery(SUMMARY, {
    variables: { month: now.getMonth() + 1, year: now.getFullYear() },
  });
  const { data: txData, loading: txLoading } = useQuery(TRANSACTIONS, { variables: {} });
  const { data: catData, loading: catLoading } = useQuery(CATEGORIES);

  const summary = summaryData?.summary;
  const recent = (txData?.transactions ?? []).slice(0, 5);
  const topCategories = [...(catData?.categories ?? [])]
    .filter((c) => c.transactionsCount > 0)
    .sort((a, b) => b.transactionsCount - a.transactionsCount || b.totalAmount - a.totalAmount)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <SummaryCard icon={Wallet} iconClass="text-purple-base" label="Saldo total" value={summary?.balance} />
      <SummaryCard icon={CircleArrowUp} iconClass="text-brand" label="Receitas do mês" value={summary?.monthIncome} />
      <SummaryCard icon={CircleArrowDown} iconClass="text-red-base" label="Despesas do mês" value={summary?.monthExpense} />

      <Card className="self-start overflow-hidden lg:col-span-2">
        <div className="flex items-center justify-between border-b border-gray-200 pt-5 pr-3 pb-[21px] pl-6">
          <Overline>Transações recentes</Overline>
          <SectionLink to="/transacoes">Ver todas</SectionLink>
        </div>

        {recent.map((t) => (
          <div key={t.id} className="flex h-20 items-center border-b border-gray-200">
            <div className="flex min-w-0 flex-1 items-center gap-4 px-6">
              <CategoryIconBox icon={t.category.icon} color={t.category.color} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-base leading-6 font-medium text-gray-800">{t.description}</span>
                <span className="text-sm leading-5 text-gray-600">{formatShortDate(t.date)}</span>
              </div>
            </div>
            <div className="hidden w-40 shrink-0 justify-center sm:flex">
              <Tag color={t.category.color} label={t.category.title} />
            </div>
            <div className="flex w-40 shrink-0 items-center justify-end gap-2 px-6">
              <span className="text-sm leading-5 font-semibold whitespace-nowrap text-gray-800">
                {signedAmount(t.type, formatCurrency(t.amount))}
              </span>
              {t.type === "INCOME" ? (
                <CircleArrowUp className="size-4 shrink-0 text-green-base" aria-label="Receita" />
              ) : (
                <CircleArrowDown className="size-4 shrink-0 text-red-base" aria-label="Despesa" />
              )}
            </div>
          </div>
        ))}

        {!txLoading && recent.length === 0 && (
          <p className="border-b border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
            Nenhuma transação registrada ainda.
          </p>
        )}

        <div className="flex justify-center px-6 py-5">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1 text-sm leading-5 font-medium text-brand hover:underline"
          >
            <Plus className="size-5" aria-hidden />
            Nova transação
          </button>
        </div>
      </Card>

      <Card className="self-start">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 pt-5 pb-[21px]">
          <Overline>Categorias</Overline>
          <SectionLink to="/categorias">Gerenciar</SectionLink>
        </div>
        <div className="flex flex-col gap-5 p-6">
          {topCategories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <Tag color={c.color} label={c.title} />
              <span className="flex-1 text-right text-sm leading-5 text-gray-600">
                {pluralizeItems(c.transactionsCount)}
              </span>
              <span className="min-w-[88px] shrink-0 text-right text-sm leading-5 font-semibold whitespace-nowrap text-gray-800">
                {formatCurrency(c.totalAmount)}
              </span>
            </div>
          ))}
          {!catLoading && topCategories.length === 0 && (
            <p className="text-center text-sm text-gray-500">Nenhuma categoria com transações.</p>
          )}
        </div>
      </Card>

      <TransactionDialog open={isDialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  iconClass,
  label,
  value,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value?: number;
}) {
  return (
    <Card className="flex flex-col gap-4 p-[25px]">
      <div className="flex items-center gap-3">
        <Icon className={cn("size-5", iconClass)} aria-hidden />
        <Overline>{label}</Overline>
      </div>
      <strong className="text-[28px] leading-8 font-bold text-gray-800">
        {value === undefined ? "—" : formatCurrency(value)}
      </strong>
    </Card>
  );
}

function SectionLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm leading-5 font-medium text-brand hover:underline">
      {children}
      <ChevronRight className="size-5" aria-hidden />
    </Link>
  );
}
