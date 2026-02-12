import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-center mb-2">Crear Cuenta</h1>
      <p className="text-muted-foreground text-center mb-6">
        Registrate para agendar tus citas medicas
      </p>
      <RegisterForm />
    </div>
  );
}
