"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  AdminStats,
  ChartDataPoint,
  RevenueDataPoint,
  Profile,
  Doctor,
  Specialty,
  MedicalCenter,
  Appointment,
  Payment,
  Promotion,
  LabOrder,
  ExamOrder,
  UserRole,
  AppointmentStatus,
  OrderStatus,
} from "@/types";

// ============================================================
// STATS & CHARTS
// ============================================================

export function useAdminStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async (): Promise<AdminStats> => {
      const { data, error } = await supabase.rpc("get_admin_stats" as never);
      if (error) throw error;
      return data as unknown as AdminStats;
    },
    refetchInterval: 60000,
  });
}

export function useAppointmentsChart(days = 30) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "chart", "appointments", days],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const { data, error } = await supabase.rpc("get_appointments_chart" as never, { p_days: days });
      if (error) throw error;
      return (data as unknown as ChartDataPoint[]) || [];
    },
  });
}

export function useRevenueChart(months = 12) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "chart", "revenue", months],
    queryFn: async (): Promise<RevenueDataPoint[]> => {
      const { data, error } = await supabase.rpc("get_revenue_chart" as never, { p_months: months });
      if (error) throw error;
      return (data as unknown as RevenueDataPoint[]) || [];
    },
  });
}

// ============================================================
// USERS
// ============================================================

export function useAdminUsers() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// DOCTORS
// ============================================================

export function useAdminDoctors() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "doctors"],
    queryFn: async (): Promise<Doctor[]> => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*, specialty:specialties(name)")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDoctor() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctor: {
      full_name: string;
      specialty_id: string;
      consultation_price: number;
      license_number?: string;
      bio?: string;
      avatar_url?: string;
    }) => {
      const { data, error } = await supabase
        .from("doctors")
        .insert(doctor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateDoctor() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      full_name?: string;
      specialty_id?: string;
      consultation_price?: number;
      license_number?: string;
      bio?: string;
      avatar_url?: string;
      is_active?: boolean;
    }) => {
      const { error } = await supabase.from("doctors").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// SPECIALTIES
// ============================================================

export function useAdminSpecialties() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "specialties"],
    queryFn: async (): Promise<(Specialty & { doctor_count: number })[]> => {
      const { data, error } = await supabase
        .from("specialties")
        .select("*, doctors(count)")
        .order("sort_order");
      if (error) throw error;
      return (data || []).map((s) => ({
        ...s,
        doctor_count: (s.doctors as unknown as { count: number }[])?.[0]?.count || 0,
      }));
    },
  });
}

export function useCreateSpecialty() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (specialty: {
      name: string;
      description?: string;
      icon_name: string;
      is_popular?: boolean;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("specialties")
        .insert(specialty)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "specialties"] });
    },
  });
}

export function useUpdateSpecialty() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      description?: string;
      icon_name?: string;
      is_popular?: boolean;
      sort_order?: number;
    }) => {
      const { error } = await supabase.from("specialties").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "specialties"] });
    },
  });
}

// ============================================================
// MEDICAL CENTERS
// ============================================================

export function useAdminCenters() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "centers"],
    queryFn: async (): Promise<MedicalCenter[]> => {
      const { data, error } = await supabase
        .from("medical_centers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCenter() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (center: {
      name: string;
      address: string;
      phone?: string;
      hours?: string;
      lat?: number;
      lng?: number;
    }) => {
      const { data, error } = await supabase
        .from("medical_centers")
        .insert(center)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "centers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateCenter() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      address?: string;
      phone?: string;
      hours?: string;
      lat?: number;
      lng?: number;
      is_active?: boolean;
    }) => {
      const { error } = await supabase.from("medical_centers").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "centers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// APPOINTMENTS
// ============================================================

export function useAdminAppointments() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: async (): Promise<(Appointment & { patient?: Profile })[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, doctor:doctors(full_name, specialty:specialties(name)), medical_center:medical_centers(name), patient:profiles!appointments_patient_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as (Appointment & { patient?: Profile })[];
    },
  });
}

export function useUpdateAppointmentStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// PAYMENTS
// ============================================================

export function useAdminPayments() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async (): Promise<(Payment & { patient?: Profile })[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, patient:profiles!payments_patient_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as (Payment & { patient?: Profile })[];
    },
  });
}

export function useUpdatePaymentStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("payments")
        .update({ status, ...(status === "completed" ? { paid_at: new Date().toISOString() } : {}) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// PROMOTIONS
// ============================================================

export function useAdminPromotions() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*, specialty:specialties(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePromotion() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: {
      title: string;
      description?: string;
      type: string;
      discount_value: number;
      coupon_code: string;
      specialty_id?: string;
      valid_from: string;
      valid_to: string;
      max_uses?: number;
      gradient_from?: string;
      gradient_to?: string;
      icon_name?: string;
    }) => {
      const { data, error } = await supabase
        .from("promotions")
        .insert({
          ...promotion,
          coupon_code: promotion.coupon_code.toUpperCase(),
          specialty_id: promotion.specialty_id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promotions"] });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useUpdatePromotion() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; is_active?: boolean; [key: string]: unknown }) => {
      const { error } = await supabase.from("promotions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promotions"] });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

// ============================================================
// LAB ORDERS
// ============================================================

export function useAdminLabOrders() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "lab-orders"],
    queryFn: async (): Promise<(LabOrder & { patient?: Profile })[]> => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select("*, lab_test_type:lab_test_types(name, category), patient:profiles!lab_orders_patient_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as (LabOrder & { patient?: Profile })[];
    },
  });
}

export function useUpdateLabOrderStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      results_url,
    }: {
      id: string;
      status: OrderStatus;
      results_url?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (results_url) {
        updates.results_url = results_url;
        updates.results_available_at = new Date().toISOString();
      }
      const { error } = await supabase.from("lab_orders").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// EXAM ORDERS
// ============================================================

export function useAdminExamOrders() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "exam-orders"],
    queryFn: async (): Promise<(ExamOrder & { patient?: Profile })[]> => {
      const { data, error } = await supabase
        .from("exam_orders")
        .select("*, exam_type:exam_types(name, category), medical_center:medical_centers(name), patient:profiles!exam_orders_patient_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as (ExamOrder & { patient?: Profile })[];
    },
  });
}

export function useUpdateExamOrderStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      results_url,
    }: {
      id: string;
      status: OrderStatus;
      results_url?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (results_url) {
        updates.results_url = results_url;
        updates.results_available_at = new Date().toISOString();
      }
      const { error } = await supabase.from("exam_orders").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exam-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// ============================================================
// RECENT ACTIVITY (for dashboard)
// ============================================================

export function useAdminRecentActivity() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin", "recent-activity"],
    queryFn: async () => {
      const [appointmentsRes, labRes, examRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, date, start_time, status, created_at, doctor:doctors(full_name), patient:profiles!appointments_patient_id_fkey(full_name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("lab_orders")
          .select("id, scheduled_date, status, created_at, lab_test_type:lab_test_types(name), patient:profiles!lab_orders_patient_id_fkey(full_name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("exam_orders")
          .select("id, scheduled_date, status, created_at, exam_type:exam_types(name), patient:profiles!exam_orders_patient_id_fkey(full_name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      return {
        appointments: appointmentsRes.data || [],
        labOrders: labRes.data || [],
        examOrders: examRes.data || [],
      };
    },
    refetchInterval: 60000,
  });
}
