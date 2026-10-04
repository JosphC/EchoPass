import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppNotification } from '../../../services/api/schemas/notification';
import { getRepositories } from '../../../services/providers';

const repos = getRepositories();

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function group(notifications: AppNotification[]): { today: AppNotification[]; yesterday: AppNotification[]; older: AppNotification[] } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const groups = { today: [] as AppNotification[], yesterday: [] as AppNotification[], older: [] as AppNotification[] };
  for (const n of notifications) {
    const key = dayKey(n.createdAt);
    if (key === today) groups.today.push(n);
    else if (key === yesterday) groups.yesterday.push(n);
    else groups.older.push(n);
  }
  return groups;
}

export function useNotifications() {
  const client = useQueryClient();
  const list = useQuery({ queryKey: ['notifications'], queryFn: () => repos.notification.getNotifications() });
  const markRead = useMutation({
    mutationFn: (id: string) => repos.notification.markRead(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    groups: group(list.data ?? []),
    isLoading: list.isLoading,
    markRead: (id: string) => markRead.mutate(id),
  };
}
