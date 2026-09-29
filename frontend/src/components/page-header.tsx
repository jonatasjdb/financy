import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="text-2xl leading-8 font-bold text-gray-800">{title}</h1>
        <p className="text-base leading-6 text-gray-600">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
