import { PageLayout } from '@/app/components/layouts/page-layout';
import { useGetServerLogsContent } from '@/hooks/useServerLogs';
import { ServerLogViewer } from './components/ServerLogViewer';
import { logParser } from './utils';
export const ServerLogs = () => {
  const { data, isLoading, isError } = useGetServerLogsContent();
  const parsedLogs = logParser(data?.content || '');

  if (isLoading) {
    return (
      <PageLayout>
        <div>Loading...</div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div>Error fetching server logs</div>
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <ServerLogViewer logs={parsedLogs} />
    </PageLayout>
  );
};
