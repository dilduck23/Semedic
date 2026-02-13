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
  | "promotion"
  | "lab_results_ready"
  | "exam_results_ready"
  | "video_session_starting"
  | "chat_message";

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

// Phase 5: Telemedicine, Chat, Lab & Exam types

export type ChatMessageType = "text" | "file" | "system";

export type OrderStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type VideoSessionStatus = "waiting" | "active" | "completed" | "cancelled";

export interface ChatRoom {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  appointment?: Appointment;
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  type: ChatMessageType;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  is_read: boolean;
  created_at: string;
}

export interface VideoSession {
  id: string;
  appointment_id: string;
  room_name: string;
  room_url: string;
  host_token: string | null;
  participant_token: string | null;
  status: VideoSessionStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface LabTestType {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  preparation_instructions: string | null;
  results_time_hours: number;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface LabOrder {
  id: string;
  patient_id: string;
  lab_test_type_id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  scheduled_date: string;
  scheduled_time: string;
  status: OrderStatus;
  price: number;
  notes: string | null;
  results_url: string | null;
  results_available_at: string | null;
  created_at: string;
  updated_at: string;
  lab_test_type?: LabTestType;
}

export interface ExamType {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  preparation_instructions: string | null;
  results_time_hours: number;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ExamOrder {
  id: string;
  patient_id: string;
  exam_type_id: string;
  center_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: OrderStatus;
  price: number;
  notes: string | null;
  results_url: string | null;
  results_available_at: string | null;
  created_at: string;
  updated_at: string;
  exam_type?: ExamType;
  medical_center?: MedicalCenter;
}

// Phase 7: Admin Panel types

export interface AdminStats {
  total_users: number;
  total_doctors: number;
  total_specialties: number;
  total_centers: number;
  appointments_today: number;
  appointments_pending: number;
  appointments_confirmed: number;
  appointments_completed: number;
  appointments_cancelled: number;
  revenue_this_month: number;
  revenue_last_month: number;
  lab_orders_total: number;
  lab_orders_pending: number;
  exam_orders_total: number;
  exam_orders_pending: number;
  active_promotions: number;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface RevenueDataPoint {
  month: string;
  label: string;
  revenue: number;
}
