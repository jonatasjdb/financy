import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/transacoes", label: "Transações" },
  { to: "/categorias", label: "Categorias" },
];

export function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-4 pt-4 pb-[17px] sm:px-12">
        <div className="relative mx-auto flex max-w-[1184px] items-center justify-between gap-4">
          <Link to="/" aria-label="Ir para o dashboard">
            <Logo />
          </Link>

          <nav className="flex items-center gap-5 text-sm leading-5 whitespace-nowrap md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    "transition-colors hover:text-brand",
                    isActive ? "font-semibold text-brand" : "text-gray-600",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/perfil" aria-label="Meu perfil" className="rounded-full focus-visible:outline-2 focus-visible:outline-brand">
            <Avatar name={user?.name ?? ""} />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 p-4 sm:p-12">
        <Outlet />
      </main>
    </div>
  );
}
