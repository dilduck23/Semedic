"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LabOrderState {
  testTypeId: string | null;
  testTypeName: string | null;
  testTypePrice: number | null;
  address: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  notes: string;

  setTestType: (id: string, name: string, price: number) => void;
  setAddress: (address: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState = {
  testTypeId: null,
  testTypeName: null,
  testTypePrice: null,
  address: "",
  scheduledDate: null,
  scheduledTime: null,
  notes: "",
};

export const useLabOrderStore = create<LabOrderState>()(
  persist(
    (set) => ({
      ...initialState,

      setTestType: (id, name, price) =>
        set({ testTypeId: id, testTypeName: name, testTypePrice: price }),
      setAddress: (address) => set({ address }),
      setDate: (date) => set({ scheduledDate: date, scheduledTime: null }),
      setTime: (time) => set({ scheduledTime: time }),
      setNotes: (notes) => set({ notes }),
      reset: () => set(initialState),
    }),
    {
      name: "semedic-lab-order",
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
