/**
 * Timeline-ul splash-ului (port 1:1 din varianta web): o singura rulare de
 * 2600 ms. Unda e complet vizibila pana la 40%, se retrage spre dreapta
 * pana la 78%, se redeseneaza de la stanga pana la 100%.
 *
 * ATENTIE worklets: corpurile NU citesc constante din exterior (nici din
 * acest modul — UI thread-ul arunca „Property 'X' doesn't exist"). Lungimea
 * undei (362.65) apare ca literal. Exporturile sunt doar pentru JS thread.
 */

export const SPLASH_MS = 2600;
export const WAVE_L = 362.65;

function sstep(a: number, b: number, x: number): number {
  'worklet';
  if (x <= a) return 0;
  if (x >= b) return 1;
  const t = (x - a) / (b - a);
  return t * t * (3 - 2 * t);
}

/** Offset-ul de reveal (dashoffset) pentru unda si canalul de sub ea. */
export function waveOffset(c: number): number {
  'worklet';
  if (c < 0.4) return 0;
  if (c < 0.78) return -(((c - 0.4) / 0.38) * 362.65);
  if (c >= 1) return 0;
  return (1 - (c - 0.78) / 0.22) * 362.65;
}

/** Umplerea interioara a buclelor (vizibila doar pe portiuni din ciclu). */
export function innerOpacity(c: number): number {
  'worklet';
  if (c < 0.4) return 1;
  if (c < 0.78) return (c - 0.4) / 0.38 < 0.5 ? 1 : 0;
  if (c >= 1) return 1;
  return (c - 0.78) / 0.22 > 0.3 ? 1 : 0;
}

/** Procentul barei (0% -> 100%), pilula + textul de dedesubt. */
export function pctText(c: number): string {
  'worklet';
  let n = Math.floor(c * 100);
  if (n < 0) n = 0;
  if (n > 100) n = 100;
  return n + '%';
}

export function barAlpha(c: number): number {
  'worklet';
  return 1 - sstep(0.985, 1, c);
}

export function loadAlpha(c: number): number {
  'worklet';
  return 1 - sstep(0.985, 1, c);
}

export function welcomeAlpha(c: number): number {
  'worklet';
  return sstep(0.985, 1, c);
}
