"use client";

import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function PageHeader({ title, showBack = true, onBack }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="pt-12 lg:pt-6 pb-4 px-6 flex items-center bg-card sticky top-0 z-20 shadow-sm transition-colors duration-200">
      {showBack && (
        <button
          onClick={onBack ?? (() => router.back())}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MaterialIcon
            name="arrow_back"
            className="text-gray-800 dark:text-white"
          />
        </button>
      )}
      <h1
        className={`text-xl font-bold text-gray-900 dark:text-white flex-1 text-center ${showBack ? "pr-10" : ""}`}
      >
        {title}
      </h1>
    </header>
  );
}
