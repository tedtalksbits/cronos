import { IHistory } from '@/app/routes/history/types';
import { RestResponse } from '@/app/types/api';
import { getLocalAuthToken } from '@/providers/AuthProvider';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/*
  ========================================
  query params:
  const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const sortField = (req.query.sortField as string) || 'timestamp';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const search = req.query.search as string; // Search input
    const actionType = req.query.actionType as string; // Filter by actionType
    const entityType = req.query.entityType as string; // Filter by entityType
    const userId = req.query.userId as string; // Filter by user
    const startDate = req.query.startDate as string; // Date range start
    const endDate = req.query.endDate as string; // Date range end


  ========================================
*/

export interface HistoryQueryParams {
  page: number;
  limit: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  actionType: string;
  entityType: string;
  userId: string;
  startDate: string;
  endDate: string;
  includeBot?: boolean;
}

const useGetHistory = (query?: HistoryQueryParams) => {
  if (!query) {
    query = {
      page: 1,
      limit: 50,
      sortField: 'timestamp',
      sortOrder: 'desc',
      search: '',
      actionType: '',
      entityType: '',
      userId: '',
      startDate: '',
      endDate: '',
      includeBot: false,
    };
  }
  return useQuery<RestResponse<IHistory[]>, Error>({
    queryKey: ['history', query],
    queryFn: async () => {
      const url = new URL(`${import.meta.env.VITE_APP_API_URL}/history`);
      Object.keys(query).forEach((key) =>
        url.searchParams.append(
          key,
          query[key as keyof HistoryQueryParams] as string
        )
      );

      const localAuthToken = getLocalAuthToken();

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to fetch history');
      }

      return response.json();
    },
    placeholderData: keepPreviousData,
  });
};

export { useGetHistory };
