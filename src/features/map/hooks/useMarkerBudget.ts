import { useEffect, useRef, useState } from 'react';

const FIRST_MARKER_BATCH = 20;
const NEXT_MARKER_BATCH = 30;
const MARKER_BATCH_MS = 32;
const LOCATE_DELAY_MS = 1500;

export function useMarkerBudget(
  fullCount: number,
  ready: boolean,
  located = true,
  onLocated?: () => void,
): number {
  const [budget, setBudget] = useState(0);
  const locateAsked = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (budget >= fullCount) return;
    if (budget === 0) {
      setBudget(Math.min(FIRST_MARKER_BATCH, fullCount));
      return;
    }
    const id = setTimeout(() => {
      setBudget((c) => Math.min(c + NEXT_MARKER_BATCH, fullCount));
    }, MARKER_BATCH_MS);
    return () => clearTimeout(id);
  }, [ready, budget, fullCount]);

  useEffect(() => {
    if (located || !onLocated || locateAsked.current) return;
    if (!ready || budget < fullCount) return;
    locateAsked.current = true;
    const id = setTimeout(() => {
      onLocated();
    }, LOCATE_DELAY_MS);
    return () => clearTimeout(id);
  }, [located, onLocated, ready, budget, fullCount]);

  return budget;
}
