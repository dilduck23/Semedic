export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    CALLBACK: "/auth/callback",
  },
  DASHBOARD: "/dashboard",
  SPECIALTIES: "/specialties",
  DOCTORS: "/doctors",
  BOOKING: {
    DATE_TIME: "/booking/date-time",
    CONFIRM: "/booking/confirm",
    PAYMENT: "/booking/payment",
    SUCCESS: "/booking/success",
  },
  APPOINTMENTS: "/appointments",
  CHAT: "/chat",
  PROFILE: "/profile",
  NOTIFICATIONS: "/notifications",
  PROMOTIONS: "/promotions",
  LAB_ORDERS: "/lab-orders",
  EXAM_ORDERS: "/exam-orders",
  VIDEO: "/video",
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    DOCTORS: "/admin/doctors",
    SPECIALTIES: "/admin/specialties",
    CENTERS: "/admin/centers",
    APPOINTMENTS: "/admin/appointments",
    PAYMENTS: "/admin/payments",
    PROMOTIONS: "/admin/promotions",
    LAB_ORDERS: "/admin/lab-orders",
    EXAM_ORDERS: "/admin/exam-orders",
  },
} as const;

export const SPECIALTY_ICONS: Record<string, string> = {
  coronavirus: "coronavirus",
  cardiology: "cardiology",
  monitor_heart: "monitor_heart",
  medical_services: "medical_services",
  dermatology: "dermatology",
  glucose: "glucose",
  gastroenterology: "gastroenterology",
  female: "female",
  stethoscope: "stethoscope",
  neurology: "neurology",
  nutrition: "nutrition",
  visibility: "visibility",
  orthopedics: "orthopedics",
  hearing: "hearing",
  child_care: "child_care",
  psychology: "psychology",
  urology: "urology",
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistio",
};

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  no_show: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Tarjeta de Credito",
  cash: "Efectivo",
  insurance: "Seguro Medico",
};

export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  credit_card: "credit_card",
  cash: "payments",
  insurance: "health_and_safety",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
};

export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  appointment_confirmed: "check_circle",
  appointment_cancelled: "cancel",
  appointment_reminder: "alarm",
  promotion: "local_offer",
  lab_results_ready: "science",
  exam_results_ready: "biotech",
  video_session_starting: "videocam",
  chat_message: "chat_bubble",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  in_progress: "En Progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export const LAB_CATEGORIES = ["Todos", "Sangre", "Orina", "Hormonal"] as const;

export const EXAM_CATEGORIES = ["Todos", "Radiologia", "Ecografia", "Resonancia", "Tomografia", "Otro"] as const;

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const DAY_NAMES_ES = ["D", "L", "M", "M", "J", "V", "S"] as const;

export const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;
