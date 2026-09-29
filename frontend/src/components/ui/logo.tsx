import logo from "@/assets/logo.svg";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return <img src={logo} alt="Financy" className={cn("h-6 w-[100px]", className)} />;
}
