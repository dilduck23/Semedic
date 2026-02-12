import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-center mb-2">
        Bienvenido de nuevo
      </h1>
      <p className="text-muted-foreground text-center mb-6">
        Inicia sesion para acceder a tu cuenta
      </p>
      <LoginForm />
    </div>
  );
}
