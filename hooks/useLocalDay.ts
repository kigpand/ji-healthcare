import { getStartOfLocalDayTimestamp } from "@/utils/date";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useLocalDay() {
  const [today, setToday] = useState(() => getStartOfLocalDayTimestamp(new Date()));

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const syncDay = () => {
      const now = new Date();
      setToday(getStartOfLocalDayTimestamp(now));
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      clearTimeout(timeout);
      timeout = setTimeout(syncDay, nextMidnight.getTime() - now.getTime());
    };

    syncDay();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") syncDay();
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, []);

  return today;
}
