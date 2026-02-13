"use client";

import { MaterialIcon } from "@/components/shared/material-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ResultsCardProps {
  resultsUrl: string;
  availableAt?: string | null;
}

export function ResultsCard({ resultsUrl, availableAt }: ResultsCardProps) {
  const formattedDate = availableAt
    ? new Date(availableAt).toLocaleDateString("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
            <MaterialIcon name="description" className="text-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">
              Resultados Disponibles
            </h3>
            {formattedDate && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                Disponible desde {formattedDate}
              </p>
            )}
            <Button
              asChild
              size="sm"
              className="mt-3 bg-green-600 hover:bg-green-700"
            >
              <a href={resultsUrl} target="_blank" rel="noopener noreferrer">
                <MaterialIcon name="download" className="text-base mr-1" />
                Descargar Resultados
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
