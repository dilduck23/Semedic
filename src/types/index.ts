export type UserRole = "patient" | "doctor" | "admin";

export type AppointmentType = "presencial" | "virtual";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type PromotionType = "percentage" | "fixed" | "bundle" | "first_visit";

export type PaymentMethod = "credit_card" | "cash" | "insurance";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type NotificationType =
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_reminder"
  | "promotion";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
  icon_name: string;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  doctor_count?: number;
}

export interface MedicalCenter {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  hours: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string | null;
  specialty_id: string;
  full_name: string;
  license_number: string | null;
  bio: string | null;
  consultation_price: number;
  rating: number;
  total_reviews: number;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  specialty?: Specialty;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  center_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  center_id: string | null;
  type: AppointmentType;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  price: number;
  promotion_id: string | null;
  discount_amount: number;
  final_price: number | null;
  payment_status: PaymentStatus;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  medical_center?: MedicalCenter;
}

export interface Promotion {
  id: string;
  type: PromotionType;
  title: string;
  description: string | null;
  discount_value: number;
  specialty_id: string | null;
  coupon_code: string | null;
  gradient_from: string;
  gradient_to: string;
  icon_name: string;
  valid_from: string;
  valid_to: string;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  specialty?: Specialty;
}

export interface TimeSlot {
  slot_time: string;
  is_available: boolean;
}

export interface Payment {
  id: string;
  appointment_id: string;
  patient_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface CouponValidation {
  promotion_id: string | null;
  promotion_type: PromotionType | null;
  title: string | null;
  discount_value: number | null;
  is_valid: boolean;
  error_message: string | null;
}
