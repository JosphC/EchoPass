import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Station } from '../../../features/map/stations';
import { getRepositories } from '../../../services/providers';
import type { Report } from '../../../services/api/schemas/report';

/** Live disruption reports for a station's lines, most confirmed first. */
export function useLiveMapReports(station: Station) {
  const reports = useQuery({ queryKey: ['reports'], queryFn: () => getRepositories().report.getReports() });
  const alerts: Report[] = useMemo(() => {
    const now = Date.now();
    return (reports.data ?? [])
      .filter((r) => station.lines.includes(r.line) && new Date(r.expiresAt).getTime() > now)
      .sort((a, b) => b.confirmations - a.confirmations);
  }, [reports.data, station]);

  return { alerts };
}
