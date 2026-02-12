"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BookingState {
  specialtyId: string | null;
  specialtyName: string | null;
  doctorId: string | null;
  doctorName: string | null;
  centerId: string | null;
  centerName: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  appointmentType: "presencial" | "virtual";
  price: number | null;
  promotionId: string | null;
  couponCode: string | null;
  discountAmount: number;
  finalPrice: number | null;
  notes: string;
  paymentMethod: "credit_card" | "cash" | "insurance" | null;
  appointmentId: string | null;

  setSpecialty: (id: string, name: string) => void;
  setDoctor: (id: string, name: string, price: number) => void;
  setCenter: (id: string, name: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setType: (type: "presencial" | "virtual") => void;
  setNotes: (notes: string) => void;
  setCoupon: (promotionId: string, code: string, discountAmount: number, finalPrice: number) => void;
  clearCoupon: () => void;
  setPaymentMethod: (method: "credit_card" | "cash" | "insurance") => void;
  setAppointmentId: (id: string) => void;
  reset: () => void;
}

const initialState = {
  specialtyId: null,
  specialtyName: null,
  doctorId: null,
  doctorName: null,
  centerId: null,
  centerName: null,
  selectedDate: null,
  selectedTime: null,
  appointmentType: "presencial" as const,
  price: null,
  notes: "",
  promotionId: null,
  couponCode: null,
  discountAmount: 0,
  finalPrice: null,
  paymentMethod: null,
  appointmentId: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,

      setSpecialty: (id, name) => set({ specialtyId: id, specialtyName: name }),
      setDoctor: (id, name, price) =>
        set({ doctorId: id, doctorName: name, price }),
      setCenter: (id, name) => set({ centerId: id, centerName: name }),
      setDate: (date) => set({ selectedDate: date, selectedTime: null }),
      setTime: (time) => set({ selectedTime: time }),
      setType: (type) => set({ appointmentType: type }),
      setNotes: (notes) => set({ notes }),
      setCoupon: (promotionId, code, discountAmount, finalPrice) =>
        set({ promotionId, couponCode: code, discountAmount, finalPrice }),
      clearCoupon: () =>
        set({ promotionId: null, couponCode: null, discountAmount: 0, finalPrice: null }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setAppointmentId: (id) => set({ appointmentId: id }),
      reset: () => set(initialState),
    }),
    {
      name: "semedic-booking",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return sessionStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          length: 0,
          clear: () => {},
          key: () => null,
        } satisfies Storage;
      }),
    }
  )
);
