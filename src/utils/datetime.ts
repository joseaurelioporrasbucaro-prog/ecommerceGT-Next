import { useFormatter } from 'next-intl';

export type DateInput = Date | string | number | null | undefined;
type NumberFormatOptions = Parameters<ReturnType<typeof useFormatter>['number']>[1];

function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === '') return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function useDateFmt() {
  const format = useFormatter();

  return {
    short: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { dateStyle: 'short' }) : fallback;
    },
    medium: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { dateStyle: 'medium' }) : fallback;
    },
    monthYear: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { month: 'long', year: 'numeric' }) : fallback;
    },
    dayMonth: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { day: '2-digit', month: 'short' }) : fallback;
    },
    weekdayShort: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { weekday: 'short' }) : fallback;
    },
    time: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { hour: '2-digit', minute: '2-digit' }) : fallback;
    },
    dateTime: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { dateStyle: 'medium', timeStyle: 'short' }) : fallback;
    },
    relative: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.relativeTime(date, new Date()) : fallback;
    },
    number: (value: number, options?: NumberFormatOptions) =>
      format.number(value, options),
  };
}
