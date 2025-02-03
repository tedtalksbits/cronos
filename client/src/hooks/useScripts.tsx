import { RestResponse } from '@/app/types/api';
import { APIError } from '@/lib/CustomError';
import { getLocalAuthToken } from '@/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
const { VITE_APP_API_URL } = import.meta.env;
export interface Script {
  _id: string;
  name: string;
  content: string;
  description: string;
  path: string;
  language: 'bash' | 'python' | 'node' | 'other'; // Customize as needed
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
const useGetAllScripts = () => {
  return useQuery<RestResponse<Script[]>, APIError>({
    queryKey: ['scripts'],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken();

      const response = await fetch(`${VITE_APP_API_URL}/scripts`, {
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw APIError(response.status, errorResponse.message);
      }

      const data = await response.json();
      return data;
    },
  });
};

const useGetScript = (scriptId: string) => {
  return useQuery<RestResponse<Script>, APIError>({
    queryKey: ['scripts', scriptId],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/scripts/${scriptId}`, {
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw APIError(response.status, errorResponse.message);
      }

      const data = await response.json();
      return data;
    },
  });
};

const useCreateScript = () => {
  const queryClient = useQueryClient();
  return useMutation<RestResponse<Script>, APIError, Partial<Script>>({
    mutationFn: async (script) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localAuthToken}`,
        },
        body: JSON.stringify(script),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw APIError(response.status, errorResponse.message);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scripts'],
      });
    },
  });
};

const useUpdateScript = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RestResponse<Script>,
    APIError,
    {
      id: string;
      update: Partial<Script>;
    }
  >({
    mutationFn: async ({ id, update }) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/scripts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localAuthToken}`,
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw APIError(response.status, errorResponse.message);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scripts'],
      });
    },
  });
};

const useDeleteScript = () => {
  const queryClient = useQueryClient();
  return useMutation<RestResponse<Script>, APIError, string>({
    mutationFn: async (id) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/scripts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localAuthToken}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw APIError(response.status, errorResponse.message);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scripts'],
      });
    },
  });
};

const useTestScript = () => {
  return useMutation<
    RestResponse<{
      stdout: string;
      stderr: string;
      error?: string;
    }>,
    APIError,
    string
  >({
    mutationFn: async (scriptId) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(
        `${VITE_APP_API_URL}/scripts/${scriptId}/test`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localAuthToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw APIError(response.status, errorResponse.message);
      }

      const data = await response.json();
      return data;
    },
  });
};

export {
  useGetAllScripts,
  useGetScript,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
  useTestScript,
};
