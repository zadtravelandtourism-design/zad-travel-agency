import { Booking } from '../types';

/**
 * Generates sequential formatted receipt/booking reference in format:
 * YYMMXXXX
 * 
 * - YY: Last 2 digits of current year (e.g., '26' for 2026)
 * - MM: 2-digit month (01-12, e.g., '08' for August)
 * - XXXX: 4-digit sequential counter starting at '0001' and resets at the start of each month
 * 
 * Example: First receipt in August 2026 is '26080001'
 */
export function generateReceiptNumber(existingBookings: Booking[] = [], targetDate: Date = new Date()): string {
  const yearStr = targetDate.getFullYear().toString().slice(-2);
  const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');
  const prefix = `${yearStr}${monthStr}`;

  // Find all bookings created in the same year and month
  let maxSeq = 0;

  for (const b of existingBookings) {
    if (!b || !b.bookingRef) continue;
    const ref = String(b.bookingRef).trim();

    // Check if the reference matches YYMMXXXX or begins with the current YYMM prefix
    if (ref.startsWith(prefix) && ref.length >= prefix.length + 4) {
      const seqPart = parseInt(ref.slice(prefix.length, prefix.length + 4), 10);
      if (!isNaN(seqPart) && seqPart > maxSeq) {
        maxSeq = seqPart;
      }
    } else if (b.bookingDate) {
      // If booking was created in the same year-month, also inspect if it has a counter
      const bDate = new Date(b.bookingDate);
      if (!isNaN(bDate.getTime())) {
        const bYear = bDate.getFullYear().toString().slice(-2);
        const bMonth = String(bDate.getMonth() + 1).padStart(2, '0');
        if (bYear === yearStr && bMonth === monthStr) {
          // Extract any numeric suffix if available
          const numMatch = ref.match(/(\d{4})$/);
          if (numMatch) {
            const parsed = parseInt(numMatch[1], 10);
            if (!isNaN(parsed) && parsed > maxSeq && parsed < 9999) {
              maxSeq = parsed;
            }
          }
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(4, '0');
  return `${prefix}${seqStr}`;
}

/**
 * Returns a fallback receipt number if bookingRef is not yet provided or needs formatting.
 */
export function formatReceiptNumber(rawRef?: string, bookingDate?: string): string {
  if (rawRef && /^\d{8}$/.test(rawRef.trim())) {
    return rawRef.trim();
  }

  const date = bookingDate ? new Date(bookingDate) : new Date();
  const validDate = !isNaN(date.getTime()) ? date : new Date();
  const yearStr = validDate.getFullYear().toString().slice(-2);
  const monthStr = String(validDate.getMonth() + 1).padStart(2, '0');

  // If rawRef contains some digits at the end
  if (rawRef) {
    const digits = rawRef.replace(/\D/g, '');
    if (digits.length >= 8) {
      return digits.slice(-8);
    } else if (digits.length >= 4) {
      const counter = digits.slice(-4);
      return `${yearStr}${monthStr}${counter}`;
    }
  }

  return `${yearStr}${monthStr}0001`;
}
