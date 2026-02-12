"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MaterialIcon } from "@/components/shared/material-icon";
import { useSpecialties } from "@/hooks/use-specialties";
import { useBookingStore } from "@/stores/booking-store";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SpecialtiesPage() {
  const router = useRouter();
  const { data: specialties, isLoading } = useSpecialties();
  const [search, setSearch] = useState("");
  const [selectedPopular, setSelectedPopular] = useState<string | null>(null);
  const setSpecialty = useBookingStore((s) => s.setSpecialty);

  const popularSpecialties = useMemo(
    () => specialties?.filter((s) => s.is_popular) || [],
    [specialties]
  );

  const filteredSpecialties = useMemo(() => {
    let list = specialties || [];
    if (search) {
      list = list.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedPopular) {
      list = list.filter((s) => s.id === selectedPopular);
    }
    return list;
  }, [specialties, search, selectedPopular]);

  // Group by first letter
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredSpecialties> = {};
    filteredSpecialties.forEach((s) => {
      const letter = s.name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSpecialties]);

  function handleSelect(specialtyId: string, specialtyName: string) {
    setSpecialty(specialtyId, specialtyName);
    router.push(`${ROUTES.DOCTORS}?specialty_id=${specialtyId}`);
  }

  return (
    <>
      <PageHeader title="Seleccionar Especialidad" />
      <main className="px-6 lg:px-8 space-y-6 pt-4 lg:max-w-3xl">
        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MaterialIcon
              name="search"
              className="text-gray-400 group-focus-within:text-[#2A388F] transition-colors"
            />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-3.5 border-none rounded-xl bg-card text-foreground placeholder-gray-400 shadow-soft focus:ring-2 focus:ring-[#2A388F] transition-all"
            placeholder="Buscar especialidad..."
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedPopular(null);
            }}
          />
        </div>

        {/* Popular chips */}
        <div>
          <h2 className="text-lg font-bold mb-3 px-1">Populares</h2>
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1 lg:flex-wrap lg:overflow-visible lg:gap-3 lg:space-x-0">
            {popularSpecialties.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedPopular(selectedPopular === s.id ? null : s.id);
                  setSearch("");
                }}
                className={cn(
                  "flex-shrink-0 lg:flex-shrink px-4 py-2 rounded-full text-sm font-medium shadow-sm whitespace-nowrap transition-colors",
                  selectedPopular === s.id
                    ? "bg-[#2A388F] text-white shadow-md"
                    : "bg-card text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Specialty list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {grouped.map(([letter, specs]) => (
              <div key={letter}>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 px-1">
                  {letter}
                </h3>
                <div className="bg-card rounded-2xl shadow-soft overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {specs.map((specialty) => (
                    <button
                      key={specialty.id}
                      onClick={() => handleSelect(specialty.id, specialty.name)}
                      className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#2A388F] dark:text-blue-300 mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <MaterialIcon name={specialty.icon_name} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {specialty.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {specialty.doctor_count || 0} doctores disponibles
                        </p>
                      </div>
                      <MaterialIcon
                        name="chevron_right"
                        className="text-gray-400"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
