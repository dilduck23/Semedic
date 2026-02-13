import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Correo electronico invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.email("Correo electronico invalido"),
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contrasenas no coinciden",
    path: ["confirm_password"],
  });

export const profileSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  blood_type: z.string().optional(),
});

export const couponSchema = z.object({
  coupon_code: z.string().min(1, "Ingresa un codigo de cupon").max(20, "Codigo demasiado largo"),
});

export const promotionFormSchema = z.object({
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed", "bundle", "first_visit"]),
  discount_value: z.number().min(0, "El descuento debe ser positivo"),
  coupon_code: z.string().min(3, "El codigo debe tener al menos 3 caracteres").max(20),
  specialty_id: z.string().optional(),
  valid_from: z.string().min(1, "Fecha de inicio requerida"),
  valid_to: z.string().min(1, "Fecha de fin requerida"),
  max_uses: z.number().int().min(1).optional(),
  gradient_from: z.string().optional(),
  gradient_to: z.string().optional(),
  icon_name: z.string().optional(),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, "El mensaje no puede estar vacio").max(2000, "Mensaje demasiado largo"),
});

export const labOrderSchema = z.object({
  address: z.string().min(5, "Ingresa una direccion valida"),
  scheduled_date: z.string().min(1, "Selecciona una fecha"),
  scheduled_time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().optional(),
});

export const examOrderSchema = z.object({
  center_id: z.string().min(1, "Selecciona una central medica"),
  scheduled_date: z.string().min(1, "Selecciona una fecha"),
  scheduled_time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type PromotionFormData = z.infer<typeof promotionFormSchema>;
export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
export type LabOrderFormData = z.infer<typeof labOrderSchema>;
export type ExamOrderFormData = z.infer<typeof examOrderSchema>;
