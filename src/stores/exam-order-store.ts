"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ExamOrderState {
  examTypeId: string | null;
  examTypeName: string | null;
  examTypePrice: number | null;
  prepInstructions: string | null;
  centerId: string | null;
  centerName: string | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  prepConfirmed: boolean;
  notes: string;

  setExamType: (id: string, name: string, price: number, prep: string | null) => void;
  setCenter: (id: string, name: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setPrepConfirmed: (confirmed: boolean) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState = {
  examTypeId: null,
  examTypeName: null,
  examTypePrice: null,
  prepInstructions: null,
  centerId: null,
  centerName: null,
  scheduledDate: null,
  scheduledTime: null,
  prepConfirmed: false,
  notes: "",
};

export const useExamOrderStore = create<ExamOrderState>()(
  persist(
    (set) => ({
      ...initialState,

      setExamType: (id, name, price, prep) =>
        set({
          examTypeId: id,
          examTypeName: name,
          examTypePrice: price,
          prepInstructions: prep,
        }),
      setCenter: (id, name) => set({ centerId: id, centerName: name }),
      setDate: (date) => set({ scheduledDate: date, scheduledTime: null }),
      setTime: (time) => set({ scheduledTime: time }),
      setPrepConfirmed: (confirmed) => set({ prepConfirmed: confirmed }),
      setNotes: (notes) => set({ notes }),
      reset: () => set(initialState),
    }),
    {
      name: "semedic-exam-order",
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
