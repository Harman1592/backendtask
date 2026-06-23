export const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

export const calculateCalendarDays = (startDate: Date, endDate: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
};

export const isDateInPast = (date: Date): boolean => {
  return date < new Date();
};

export const isDateInFuture = (date: Date): boolean => {
  return date > new Date();
};

export const dateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const stringToDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.abs(Math.round((endDate.getTime() - startDate.getTime()) / msPerDay));
};
