import {
  format,
  formatISO9075,
  parse,
  isBefore as fnsIsBefore,
  nextDay as fnsNextDay,
  getDay,
  Day,
} from "date-fns";
import { IObject } from "./constants";

const ONE_SEC = 1000;
const ONE_MIN = ONE_SEC * 60;
const ONE_HOUR = ONE_MIN * 60;
const ONE_DATE = ONE_HOUR * 24;

export const isDate = (date: any): boolean => {
  if (typeof date === "string") {
    return !isNaN(new Date(date).getTime());
  }
  return date instanceof Date && !isNaN(date.getTime());
};

export const isBefore = (date1: any, date2: any): boolean => {
  return (
    isDate(date1) &&
    isDate(date2) &&
    fnsIsBefore(
      parse(date1, "yyyy-MM-dd", new Date()),
      parse(date2, "yyyy-MM-dd", new Date())
    )
  );
};

export const nextDate = (date: any): Date | null => {
  return isDate(date)
    ? new Date(parse(date, "yyyy-MM-dd", new Date()).getTime() + ONE_DATE)
    : null;
};

export const nextWeekDay = (date: any, weekDay: Day): Date | null => {
  return isDate(date)
    ? fnsNextDay(parse(date, "yyyy-MM-dd", new Date()), weekDay)
    : null;
};

export const getWeekDay = (date: any): Day => {
  return isDate(date) ? getDay(parse(date, "yyyy-MM-dd", new Date())) : 1;
};

const REPEAT_INTERVAL_KEYS: IObject<Day> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};
export const parseRepeatIntervalToWeekDay = (repeatInterval: any): Day[] => {
  const days: Day[] = [];
  if (repeatInterval instanceof Object) {
    for (const key in REPEAT_INTERVAL_KEYS) {
      if (repeatInterval[key]) {
        days.push(REPEAT_INTERVAL_KEYS[key]);
      }
    }
  }
  return days;
};

// date parser for validate shape by lib yup
export const yupParserDateString = (value: any, originalValue: any) => {
  const parsedDate = isDate(originalValue)
    ? originalValue
    : parse(originalValue, "yyyy-MM-dd", new Date());

  return parsedDate;
};

// Format date as format db accepted
export const dateToDbStr = (date: Date | number) => {
  return formatISO9075(new Date(date));
};

// Get timestring format HH:mm | HH:mm:ss
export const dateToTimeStr = (
  date: Date | number,
  includingSeconds = false
) => {
  return format(new Date(date), includingSeconds ? "HH:mm:ss" : "HH:mm");
};

export const dateToUTCTimeStr = (date: Date | number) => {
  return (
    new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "") + "(UTC)"
  );
};

// Add minutes with string format HH:mm
export const addMinutesTimeStr = (hourStr: string, minutes: number) => {
  const dt = new Date();
  const hour = +hourStr.split(":")[0] || 0;
  const minuteAdded = (+hourStr.split(":")[1] || 0) + minutes;
  dt.setHours(hour);
  dt.setMinutes(minuteAdded);
  return dateToTimeStr(dt);
};

// Get datestring format yyyy-MM-dd
export const dateToDateStr = (date: Date | number) => {
  return format(new Date(date), "yyyy-MM-dd");
};

// Get datestring format yyyy-MM-dd HH:mm:ss | yyyy-MM-dd HH:mm
export const dateToDatetimeStr = (
  date: Date | number,
  includingSeconds = false
) => {
  return format(
    new Date(date),
    includingSeconds ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd HH:mm"
  );
};

// Generate raw condition start, end date sql
export const generateRawDateSql = (
  column_name: string,
  startDate?: Date,
  endDate?: Date
) => {
  let dateRawCondition = "";
  if (startDate) {
    dateRawCondition = `${column_name} > ${startDate.toISOString()}`;
  }
  if (startDate && endDate) {
    dateRawCondition = `${column_name} between '${startDate.toISOString()}' and '${endDate.toISOString()}'`;
  }
  return dateRawCondition;
};

// Get nearest segment
export const getNearestSegment = (
  start: string,
  timeMark: string,
  segment: number
) => {
  const startTime = new Date();
  const date = startTime.getDate();
  const hour = +start.split(":")[0];
  const minute = +start.split(":")[1];
  startTime.setHours(hour, minute, 0);
  while (startTime.getDate() === date) {
    if (dateToTimeStr(startTime) >= timeMark) {
      return dateToTimeStr(startTime);
    }
    startTime.setMinutes(startTime.getMinutes() + segment);
  }
  return timeMark;
};

// Regex Date MM/DD
export const REGEX_DATE_MMDD = /^(((0?[13578]|10|12)(-|\/)((0[1-9])|([12])([0-9]?)|(3[01]?)))|((0?[469]|11)(-|\/)((0[1-9])|([12])([0-9]?)|(30)))|((02)(-|\/)((0[1-9])|([12])([0-9]?))))$/;

// Regex time
export const REGEX_TIME_HHMM = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;

export const checkTimeIsSooner = (
  target: Date | string,
  dayFromTarget: number = 0
) => {
  const now = new Date();
  const dt = new Date(target);
  dt.setDate(dt.getDate() - dayFromTarget);
  return now < dt;
};
