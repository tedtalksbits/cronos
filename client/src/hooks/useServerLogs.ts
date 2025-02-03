import { getLocalAuthToken } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

const useGetServerLogsContent = () => {
  return useQuery({
    queryKey: ['server-logs'],
    queryFn: async () => {
      const localAuthToken = getLocalAuthToken(); // Ensure you retrieve the token
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/health/logs/content`,
        {
          headers: {
            Authorization: `Bearer ${localAuthToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Unable to fetch server logs');
      }

      return response.json();
    },
    refetchInterval: 1000, // Refetch every 1 second
  });
};

export { useGetServerLogsContent };
