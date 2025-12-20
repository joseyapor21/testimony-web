export const StringHelper = {
  ifEmpty(value: string | undefined | null, defaultValue: string): string {
    if (!value || value.trim().length === 0) {
      return defaultValue;
    }
    return value;
  },

  capitalize(value: string): string {
    if (!value || value.length === 0) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },

  getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '?';
  },

  formatPhoneNumber(phone: string): string {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  truncate(value: string, maxLength: number): string {
    if (!value || value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}...`;
  },
};
