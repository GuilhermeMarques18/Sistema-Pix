import { api } from '@/app/core/http';

export type HistoryCategory = 'LOGIN' | 'ACTIVITY';
export type HistoryStatus = 'SUCCESS' | 'FAILURE';

export interface ActivityHistoryEvent {
  id: string;
  category: HistoryCategory;
  eventType: string;
  status: HistoryStatus;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityHistoryPage {
  content: ActivityHistoryEvent[];
  number: number;
  first: boolean;
  last: boolean;
  totalPages: number;
  totalElements: number;
}

export interface ActivityHistoryFilters {
  category: HistoryCategory;
  eventType?: string;
  from?: string;
  until?: string;
  page: number;
  size: number;
}

export const activityHistoryService = {
  async list(filters: ActivityHistoryFilters): Promise<ActivityHistoryPage> {
    const endpoint = filters.category === 'LOGIN' ? '/api/audit/logins' : '/api/audit/activities';
    const { data } = await api.get<ActivityHistoryPage>(endpoint, {
      params: {
        eventType: filters.eventType || undefined,
        from: filters.from || undefined,
        until: filters.until || undefined,
        page: filters.page,
        size: filters.size,
      },
    });
    return data;
  },
};
