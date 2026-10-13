/** Luhn checksum: true for plausible PANs. Never log the input. */
export function luhnValid(pan: string): boolean {
  const digits = pan.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** MM/YY expiry: valid when the last day of the month is not past. */
export function expiryValid(expiry: string, nowMs: number = Date.now()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const lastDay = new Date(year, month, 0).getTime();
  return lastDay >= nowMs;
}

export function detectNetwork(pan: string): 'visa' | 'mastercard' | 'other' {
  const digits = pan.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'visa';
  const first2 = Number(digits.slice(0, 2));
  const first4 = Number(digits.slice(0, 4));
  if ((first2 >= 51 && first2 <= 55) || (first4 >= 2221 && first4 <= 2720)) return 'mastercard';
  return 'other';
}
