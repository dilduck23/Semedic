"use client";

import { useMedicalCenters } from "@/hooks/use-medical-centers";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Skeleton } from "@/components/ui/skeleton";

export function NearMeSection() {
  const { data: centers, isLoading } = useMedicalCenters();
  const center = centers?.[0];

  if (isLoading) {
    return <Skeleton className="h-52 rounded-2xl" />;
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-lg font-bold">Cerca de Mi</h2>
        <a className="text-[#2A388F] text-sm font-semibold hover:underline" href="#">
          Ver mapa
        </a>
      </div>
      <div className="bg-card p-3 rounded-2xl shadow-soft">
        <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-700 w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-blue-100/50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <div className="bg-card p-2 rounded-full shadow-lg">
              <MaterialIcon
                name="location_on"
                className="text-[#ED1C24] text-2xl"
              />
            </div>
          </div>
        </div>
        {center && (
          <div className="mt-3 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                {center.name}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {center.address} - 2.5 km
              </p>
            </div>
            <button
              onClick={() => {
                if (center.lat && center.lng) {
                  window.open(
                    `https://maps.google.com/?q=${center.lat},${center.lng}`,
                    "_blank"
                  );
                }
              }}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[#2A388F]"
            >
              <MaterialIcon name="directions" className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
