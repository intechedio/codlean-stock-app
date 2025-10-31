import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginSchema } from "../../lib/schemas";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "./store";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../components/feedback/Toast";

type FormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const ok = await login(values.username, values.password);
    if (!ok) {
      push({
        title: "Giriş hatası",
        description: "Kullanıcı adı veya şifre yanlış",
        kind: "error",
      });
      return;
    }
    const from = (location.state as any)?.from?.pathname || "/warehouses";
    navigate(from, { replace: true });
  });

  return (
    <div className="mx-auto mt-16 w-full max-w-sm rounded-2xl border bg-card p-6 shadow">
      <h1 className="text-xl font-semibold">Giriş</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm" htmlFor="username">
            Kullanıcı Adı
          </label>
          <Input
            id="username"
            autoFocus
            placeholder="admin"
            {...register("username")}
          />
          {errors.username ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.username.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm" htmlFor="password">
            Şifre
          </label>
          <Input
            id="password"
            type="password"
            placeholder="12345"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Giriş yapılıyor…" : "Giriş Yap"}
        </Button>
      </form>
    </div>
  );
}
