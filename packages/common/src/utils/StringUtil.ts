export const StringUtil = {
  capitalize(value?: string) {
    if (!value) {
      return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },
  hexToString(hexValue: string) {
    // Remove 0x prefix if present
    const cleanHex = hexValue.startsWith('0x') ? hexValue.slice(2) : hexValue;
    // Convert hex to decimal number, then to string

    return parseInt(cleanHex, 16).toString();
  }
};
