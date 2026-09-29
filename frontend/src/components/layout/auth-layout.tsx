import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

/** Estrutura das telas de login e cadastro: logo centralizada + card de 448px. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-gray-100 px-4 py-12">
      <Logo className="h-8 w-[134px]" />
      <div className="flex w-full max-w-[448px] flex-col gap-8 rounded-xl border border-gray-200 bg-white p-[33px]">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-xl leading-7 font-bold text-gray-800">{title}</h1>
          <p className="text-base leading-6 text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-gray-300" />
      <span className="text-sm leading-5 text-gray-500">ou</span>
      <span className="h-px flex-1 bg-gray-300" />
    </div>
  );
}
