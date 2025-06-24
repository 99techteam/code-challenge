import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "do MMM, EEEE", {
    locale: enUS,
  });
}
