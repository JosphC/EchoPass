function linear(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** Readable text on a route color: near-black or white by luminance. */
export function contrastText(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#FFFFFF';
  const lum =
    0.2126 * linear(parseInt(clean.slice(0, 2), 16) / 255) +
    0.7152 * linear(parseInt(clean.slice(2, 4), 16) / 255) +
    0.0722 * linear(parseInt(clean.slice(4, 6), 16) / 255);
  return lum > 0.35 ? '#111827' : '#FFFFFF';
}
