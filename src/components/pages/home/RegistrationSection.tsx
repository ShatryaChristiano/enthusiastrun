"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // Pastikan path ini benar
import Counter from "./Counter"; // Pastikan path ini benar

type TimeParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getNextTargetDate(month: number, day: number, hour: number, minute = 0) {
  const now = new Date();
  // months are 0-based
  let target = new Date(now.getFullYear(), month - 1, day, hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setFullYear(target.getFullYear() + 1);
  }
  return target;
}

// 10 Mei 2026 05:30
const TARGET_DATE = new Date(2027, 4, 7, 5, 30, 0, 0);

function getTimeParts(ms: number): TimeParts {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function Countdown() {
  const [mounted, setMounted] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<TimeParts>(() =>
    getTimeParts(TARGET_DATE.getTime() - Date.now())
  );

  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      const parts = getTimeParts(TARGET_DATE.getTime() - Date.now());
      setTimeLeft(parts);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const partsArray: { key: keyof TimeParts; label: string; value: number }[] = [
    { key: "days", label: "Days", value: timeLeft.days },
    { key: "hours", label: "Hours", value: timeLeft.hours },
    { key: "minutes", label: "Minutes", value: timeLeft.minutes },
    { key: "seconds", label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-[280px] sm:max-w-2xl flex justify-center flex-col">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {partsArray.map(({ key, label, value }) => (
            <div key={label} className="flex flex-col items-center space-y-2">
              <div
                className={`flex h-24 py-16 w-full font-impact border-4 border-background shadow-lg items-center justify-center rounded-lg bg-countdown-background shadow-md sm:h-32`}
              >
                {mounted && (
                  <Counter
                    value={value}
                    places={key === "days" ? [100, 10, 1] : [10, 1]}
                    fontSize={40}
                    textColor="#00476D"
                    fontWeight="bold"
                    gradientFrom="transparent"
                    gradientTo="transparent"
                  />
                )}
              </div>

              <div className="w-full font-impact rounded-md bg-countdown-background border-4 border-background shadow-lg py-1.5 text-center text-sm font-regular text-[#00476D] sm:py-2 sm:text-base">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}