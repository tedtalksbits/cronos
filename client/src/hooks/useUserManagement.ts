import { RestResponse } from '@/app/types/api';
import { APIError } from '@/lib/CustomError';
import { getLocalAuthToken, User } from '@/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
const { VITE_APP_API_URL } = import.meta.env;

const useGetUsers = () => {
  return useQuery<RestResponse<User[]>, APIError>({
    queryKey: ['users'],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/auth/users`, {
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

// Get Users by ID
const useGetUser = (userId: string) => {
  return useQuery<RestResponse<User>, APIError>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/auth/users/${userId}`, {
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

// create user
const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<RestResponse<User>, APIError, Partial<User>>({
    mutationFn: async (newUser) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localAuthToken}`,
        },
        body: JSON.stringify(newUser),
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
        queryKey: ['users'],
      });
    },
  });
};

// update user
const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RestResponse<User>,
    APIError,
    {
      id: string;
      update: Partial<User>;
    }
  >({
    mutationFn: async ({ id, update }) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/auth/users/${id}`, {
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
        queryKey: ['users'],
      });
    },
  });
};

// delete user
const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<RestResponse<User>, APIError, string>({
    mutationFn: async (id) => {
      const localAuthToken = getLocalAuthToken();
      const response = await fetch(`${VITE_APP_API_URL}/auth/users/${id}`, {
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
        queryKey: ['users'],
      });
    },
  });
};

export { useGetUsers, useGetUser, useCreateUser, useUpdateUser, useDeleteUser };
