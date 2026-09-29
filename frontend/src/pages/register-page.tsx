import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Lock, LogIn, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout, Divider } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { useAuth } from "@/contexts/auth-context";
import { REGISTER } from "@/graphql/auth";
import { getErrorMessage } from "@/lib/apollo";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo"),
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [registerUser, { loading }] = useMutation(REGISTER);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });

  async function onSubmit(input: FormValues) {
    try {
      const { data } = await registerUser({ variables: { input } });
      if (!data) return;
      signIn(data.register.token, data.register.user);
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Comece a controlar suas finanças ainda hoje">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-4">
          <TextField
            label="Nome completo"
            icon={UserRound}
            placeholder="Seu nome completo"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="E-mail"
            type="email"
            icon={Mail}
            placeholder="mail@exemplo.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Senha"
            type="password"
            icon={Lock}
            placeholder="Digite sua senha"
            autoComplete="new-password"
            hint="A senha deve ter no mínimo 8 caracteres"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <Button type="submit" isLoading={loading}>
          Cadastrar
        </Button>

        <Divider />

        <div className="flex flex-col gap-4">
          <p className="text-center text-sm leading-5 text-gray-600">Já tem uma conta?</p>
          <Link
            to="/"
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-base font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <LogIn className="size-[18px]" aria-hidden />
            Fazer login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
