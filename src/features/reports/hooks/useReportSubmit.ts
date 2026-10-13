import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRepositories } from '../../../services/providers';
import type { ReportKind } from '../../../services/api/schemas/report';

const repos = getRepositories();

export function useReportSubmit() {
  const client = useQueryClient();
  const submit = useMutation({
    mutationFn: ({ kind, line }: { kind: ReportKind; line: string }) => repos.report.submitReport(kind, line),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return { submitReport: submit.mutateAsync, isSubmitting: submit.isPending };
}
