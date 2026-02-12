"use client";

import { useState, useEffect } from "react";

export function useCountdown(targetDate: string, targetTime: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calculate() {
      const target = new Date(`${targetDate}T${targetTime}`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Ahora");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (days > 0) {
        setTimeLeft(
          `En ${days} dia${days > 1 ? "s" : ""}, ${hours} hora${hours !== 1 ? "s" : ""}`
        );
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(
          `En ${hours} hora${hours !== 1 ? "s" : ""}, ${minutes} min`
        );
      }
    }

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return timeLeft;
}
