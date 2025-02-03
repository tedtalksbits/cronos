import { RestResponse } from '@/app/types/api';
import { APIError } from '@/lib/CustomError';
import { getLocalAuthToken } from '@/providers/AuthProvider';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
const { VITE_APP_API_URL } = import.meta.env;
export interface CronJobWebHook {
  _id?: string;
  url: string;
  event: 'job_started' | 'job_succeeded' | 'job_failed';
  secret?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}
export interface CronJob {
  name: string;
  command: string;
  schedule: string;
  status: 'Active' | 'Inactive';
  lastRun: Date | null;
  nextRun: Date | null;
  resourceUsage: 'Low' | 'Medium' | 'High';
  dependencies: string[];
  timezone: string;
  user: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  webhooks: CronJobWebHook[];
}

export interface ICronJobLog {
  cronJob: CronJob; // Reference to the cron job
  executedAt: Date; // Time of execution
  status: 'Success' | 'Failure'; // Execution status
  duration: number; // Duration in milliseconds
  user: string; // Reference to the user who executed the job
  stdout?: string; // Standard output
  stderr?: string; // Standard error
  stdin?: string; // Standard input
  error?: string; // Error message
  _id: string; // Unique identifier
  commandExecuted: string; // Command executed
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}

const useGetCronJobs = () => {
  return useQuery<RestResponse<CronJob[]>, APIError>({
    queryKey: ['cron-jobs'],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken(); // Ensure you retrieve the token
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/cronJobs`,
        {
          headers: {
            Authorization: `Bearer ${localAuthToken}`,
          },
        }
      );

      if (!response.ok) {
        toast.error('Error fetching cron jobs');
        const errorResponse = await response.json(); // Log the response to understand the error
        throw APIError(response.status, errorResponse.message);
      }

      const data = await response.json();

      // Ensure the data is of the expected type
      if (!data || !Array.isArray(data.data)) {
        throw new Error('Data is not of the expected type');
      }

      return data as RestResponse<CronJob[]>;
    },
  });
};

const useGetCronJob = (id: string) => {
  return useQuery<RestResponse<CronJob>, APIError>({
    queryKey: ['cron-jobs', id],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/cronJobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error fetching cron job');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
  });
};

const useCreateCronJob = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RestResponse<CronJob>,
    APIError,
    Partial<CronJob>,
    unknown
  >({
    mutationFn: async (cronJob) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/cronJobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localAuthToken}`,
        },
        body: JSON.stringify(cronJob),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error creating cron job');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cron-jobs'],
      });
    },
  });
};

const useUpdateCronJob = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RestResponse<CronJob>,
    APIError,
    Partial<CronJob>,
    unknown
  >({
    mutationFn: async (cronJob) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(
        `${VITE_APP_API_URL}/cronJobs/${cronJob._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localAuthToken}`,
          },
          body: JSON.stringify(cronJob),
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error updating cron job');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cron-jobs'],
      });
    },
  });
};

const useDeleteCronJob = () => {
  const queryClient = useQueryClient();
  return useMutation<RestResponse<CronJob>, APIError, string, unknown>({
    mutationFn: async (id) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/cronJobs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error deleting cron job');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cron-jobs'],
      });
    },
  });
};

const useGetCronJobStats = (id: string) => {
  return useQuery<RestResponse<CronJob>, APIError>({
    queryKey: ['cron-jobs-stats', id],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/cronJobs/${id}/stats`, {
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error fetching cron job stats');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
  });
};

// cronjoblogs

const useGetCronJobLogs = ({
  id,
  meta = {
    page: 1,
    limit: 50,
  },
}: {
  id: string;
  meta?: {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    status?: string;
    minDuration?: number;
    maxDuration?: number;
  };
}) => {
  if (!id) {
    throw new Error('ID must be provided');
  }
  return useQuery<RestResponse<ICronJobLog[]>, APIError>({
    queryKey: ['cron-jobs-logs', id, meta],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken();
      const url = new URL(`${VITE_APP_API_URL}/cronJobs/${id}/logs`);
      url.searchParams.set('page', meta.page.toString());
      url.searchParams.set('limit', meta.limit.toString());
      if (meta.search) {
        url.searchParams.set('search', meta.search);
      }
      if (meta.sort) {
        url.searchParams.set('sort', meta.sort);
      }
      if (meta.status) {
        url.searchParams.set('status', meta.status);
      }
      if (meta.minDuration) {
        url.searchParams.set('minDuration', meta.minDuration.toString());
      }
      if (meta.maxDuration) {
        url.searchParams.set('maxDuration', meta.maxDuration.toString());
      }
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error fetching cron job logs');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json();
    },
    placeholderData: keepPreviousData,
  });
};

// region cronJobWebHooks
const useCreateCronJobWebHook = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RestResponse<CronJob>,
    APIError,
    { webhook: Partial<CronJobWebHook>; cronJobId: string },
    unknown
  >({
    mutationFn: async ({ webhook, cronJobId }) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(
        `${VITE_APP_API_URL}/cronJobs/${cronJobId}/webhooks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localAuthToken}`,
          },
          body: JSON.stringify(webhook),
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error creating cron job webhook');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['cron-jobs', vars.cronJobId],
      });
    },
  });
};

const useUpdateCronJobWebHook = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RestResponse<CronJob>,
    APIError,
    { cronJobId: string; webhook: Partial<CronJobWebHook> },
    unknown
  >({
    mutationFn: async ({ cronJobId, webhook }) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(
        `${VITE_APP_API_URL}/cronJobs/${cronJobId}/webhooks/${webhook._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localAuthToken}`,
          },
          body: JSON.stringify(webhook),
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error updating cron job webhook');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['cron-jobs', vars.cronJobId],
      });
    },
  });
};

const useDeleteCronJobWebHook = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RestResponse<CronJob>,
    APIError,
    {
      cronJobId: string;
      webhookId: string;
    },
    unknown
  >({
    mutationFn: async ({ cronJobId, webhookId }) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(
        `${VITE_APP_API_URL}/cronJobs/${cronJobId}/webhooks/${webhookId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localAuthToken}`,
          },
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error('Error deleting cron job webhook');
        throw APIError(response.status, errorResponse.message);
      }
      return response.json() as Promise<RestResponse<CronJob>>;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['cron-jobs', vars.cronJobId],
      });
    },
  });
};

export {
  useGetCronJobs,
  useGetCronJob,
  useCreateCronJob,
  useUpdateCronJob,
  useDeleteCronJob,
  useGetCronJobStats,
  useGetCronJobLogs,
  useCreateCronJobWebHook,
  useUpdateCronJobWebHook,
  useDeleteCronJobWebHook,
};
