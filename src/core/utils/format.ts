export function formatRon(value: number): string {
  return `${value.toFixed(2)} lei`;
}

export function formatMinutes(min: number): string {
  return `${Math.round(min)} min`;
}
