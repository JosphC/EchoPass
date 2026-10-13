import { t } from '../../../core/i18n';
import { Segmented } from '../../../ui';
import type { RouteFilter } from '../options';

const FILTERS: RouteFilter[] = ['fastest', 'cheapest', 'roomiest'];

interface RouteFiltersProps {
  value: RouteFilter;
  onChange: (next: RouteFilter) => void;
}

export function RouteFilters({ value, onChange }: RouteFiltersProps) {
  const labels: Record<RouteFilter, string> = {
    fastest: t('plan.fastest'),
    cheapest: t('plan.cheapest'),
    roomiest: t('plan.roomiest'),
  };
  const options = FILTERS.map((f) => labels[f]);
  const selected = labels[value];

  return (
    <Segmented
      variant="pill"
      options={options}
      value={selected}
      onChange={(label) => {
        const found = FILTERS.find((f) => labels[f] === label);
        if (found) onChange(found);
      }}
    />
  );
}
