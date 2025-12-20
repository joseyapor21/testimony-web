import { format, parse, isValid, subDays, addDays } from 'date-fns';

export const DateHelper = {
  getSundayForDate(date: Date): Date {
    const dayOfWeek = date.getDay();
    return subDays(date, dayOfWeek);
  },

  formatDate(date: Date): string {
    return format(date, 'MM/dd/yyyy');
  },

  formatSundayRange(sunday: Date): string {
    const saturday = addDays(sunday, 6);
    return `${format(sunday, 'MM/dd/yyyy')} - ${format(saturday, 'MM/dd/yyyy')}`;
  },

  parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    // Try ISO format first
    let date = new Date(dateString);
    if (isValid(date)) return date;

    // Try MM/dd/yyyy format
    try {
      date = parse(dateString, 'MM/dd/yyyy', new Date());
      if (isValid(date)) return date;
    } catch {
      // Continue to next format
    }

    // Try yyyy-MM-dd format
    try {
      date = parse(dateString, 'yyyy-MM-dd', new Date());
      if (isValid(date)) return date;
    } catch {
      // Continue
    }

    return null;
  },

  formatDateForDisplay(dateString: string): string {
    const date = this.parseDate(dateString);
    if (!date) return 'N/A';
    return format(date, 'MM/dd/yyyy');
  },

  formatDateTimeForDisplay(dateString: string): string {
    const date = this.parseDate(dateString);
    if (!date) return 'N/A';
    return format(date, 'MM/dd/yyyy hh:mm a');
  },

  isDateInRange(date: Date, from?: Date, to?: Date): boolean {
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  },

  getSundayKey(date: Date): string {
    const sunday = this.getSundayForDate(date);
    return sunday.toISOString();
  },

  formatForInput(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  },
};
