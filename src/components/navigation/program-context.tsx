"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getCurrentDay } from "@/lib/actions/user-progress";
import { getWeekForDay } from "@/lib/curriculum/weeks";

interface ProgramContextValue {
  currentDay: number;
  currentWeek: number;
  loading: boolean;
  refreshDay: () => Promise<void>;
}

const ProgramContext = createContext<ProgramContextValue>({
  currentDay: 1,
  currentWeek: 1,
  loading: true,
  refreshDay: async () => {},
});

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchDay = useCallback(async () => {
    try {
      const day = await getCurrentDay();
      setCurrentDay(day);
    } catch {
      // Fall back to day 1
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  const refreshDay = useCallback(async () => {
    await fetchDay();
  }, [fetchDay]);

  const currentWeek = getWeekForDay(currentDay);

  return (
    <ProgramContext.Provider value={{ currentDay, currentWeek, loading, refreshDay }}>
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  return useContext(ProgramContext);
}
