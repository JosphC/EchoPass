import { useMemo } from 'react';
import { useBuses } from '../../map';
import { buildRouteOptions, sortOptions, type RouteFilter, type RouteOption } from '../options';

export function useRouteOptions(from: string, to: string, filter: RouteFilter): { options: RouteOption[]; isLoading: boolean } {
  const { buses, isLoading } = useBuses();
  const options = useMemo(() => sortOptions(buildRouteOptions(from, to, buses), filter), [from, to, buses, filter]);
  return { options, isLoading };
}
