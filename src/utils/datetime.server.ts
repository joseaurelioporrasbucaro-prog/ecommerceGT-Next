import { getFormatter } from 'next-intl/server';

import type { DateInput } from './datetime';

function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === '') return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getDateFmt() {
  const format = await getFormatter();

  return {
    short: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { dateStyle: 'short' }) : fallback;
    },
    medium: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { dateStyle: 'medium' }) : fallback;
    },
    dateTime: (input: DateInput, fallback = '-') => {
      const date = toDate(input);
      return date ? format.dateTime(date, { dateStyle: 'medium', timeStyle: 'short' }) : fallback;
    },
  };
}
