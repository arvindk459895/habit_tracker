import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

export const getDaysInMonth = (date: Date = new Date()) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
};

export const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
export const formatDayName = (date: Date) => format(date, 'EEE');
export const formatDayNumber = (date: Date) => format(date, 'd');
export const formatMonthYear = (date: Date) => format(date, 'MMMM yyyy');

export const isDateToday = (dateStr: string) => isToday(new Date(dateStr));
export const isDateSame = (dateStr1: string, dateStr2: string) => isSameDay(new Date(dateStr1), new Date(dateStr2));
