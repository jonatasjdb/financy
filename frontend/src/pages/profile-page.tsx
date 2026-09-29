import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { LogOut, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { useAuth } from "@/contexts/auth-context";
import { UPDATE_PROFILE } from "@/graphql/auth";
import { getErrorMessage } from "@/lib/apollo";

const schema = z.object({ name: z.string().trim().min(2, "Informe seu nome completo") });
type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: user?.name ?? "" } });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  async function onSubmit(input: FormValues) {
    try {
      await updateProfile({ variables: { input } });
      toast.success("Perfil atualizado");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (!user) return null;

  return (
    <div className="flex justify-center">
      <Card className="flex w-full max-w-[448px] flex-col gap-8 p-[33px]">
        <div className="flex flex-col items-center gap-6">
          <Avatar name={user.name} className="size-16 text-2xl leading-10" />
          <div className="flex w-full flex-col gap-0.5 text-center">
            <h1 className="text-xl leading-7 font-semibold text-gray-800">{user.name}</h1>
            <p className="text-base leading-6 text-gray-500">{user.email}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
          <div className="flex flex-col gap-4">
            <TextField label="Nome completo" icon={UserRound} error={errors.name?.message} {...register("name")} />
            <TextField label="E-mail" icon={Mail} value={user.email} disabled readOnly hint="O e-mail não pode ser alterado" />
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" isLoading={loading}>
              Salvar alterações
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="size-[18px] text-danger" aria-hidden />
              Sair da conta
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
