import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Lock, Mail, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout, Divider } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { useAuth } from "@/contexts/auth-context";
import { LOGIN } from "@/graphql/auth";
import { getErrorMessage } from "@/lib/apollo";

const schema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const [login, { loading }] = useMutation(LOGIN);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit({ email, password, remember }: FormValues) {
    try {
      const { data } = await login({ variables: { input: { email, password } } });
      if (data) signIn(data.login.token, data.login.user, remember);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AuthLayout title="Fazer login" subtitle="Entre na sua conta para continuar">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-4">
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm leading-5 text-gray-700">
              <input
                type="checkbox"
                className="size-4 cursor-pointer rounded border-gray-300 accent-brand"
                {...register("remember")}
              />
              Lembrar-me
            </label>
            <button
              type="button"
              onClick={() => toast.info("Recuperação de senha ainda não disponível.")}
              className="text-sm leading-5 font-medium text-brand hover:underline"
            >
              Recuperar senha
            </button>
          </div>
        </div>

        <Button type="submit" isLoading={loading}>
          Entrar
        </Button>

        <Divider />

        <div className="flex flex-col gap-4">
          <p className="text-center text-sm leading-5 text-gray-600">Ainda não tem uma conta?</p>
          <Link
            to="/cadastro"
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-base font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <UserRoundPlus className="size-[18px]" aria-hidden />
            Criar conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
