import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  CodeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ChevronsLeftIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ICronJobLog, useGetCronJobLogs } from '@/hooks/useCronJobs';
import { useWebSocket } from '@/hooks/useCronJobsWS';
import { cn } from '@/lib/utils';
import { AreaChart } from '@/components/ui/area-chart';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BarChart } from '@/components/ui/bar-chart';
import SyntaxHighlighter from '@/components/ui/syntax-highlighter';
import { PageLayout } from '@/app/components/layouts/page-layout';
import { PageHeading } from '@/app/components/page-heading';
import { ErrorPage } from '@/app/components/error';
import { LoadingPage } from '@/app/components/loading';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BREAK_POINTS, useMediaQuery } from '@/hooks/utils/useMediaQuery';
const { VITE_APP_WS_URL } = import.meta.env;
interface LogQuery {
  page: number;
  limit: number;
  search: string;
  sort: string;
  status: string;
  minDuration: number;
  maxDuration: number;
}
export const Logs = () => {
  const [query, setQuery] = useState<LogQuery>({
    page: 1,
    limit: 50,
    search: '',
    sort: '',
    status: '',
    minDuration: 0,
    maxDuration: 0,
  });

  const location = useLocation();
  const { wsState } = useWebSocket(VITE_APP_WS_URL);
  const { id } = useParams();
  const isDesktop = useMediaQuery(BREAK_POINTS.md);
  if (!id) {
    throw new Error('ID must be provided');
  }

  const {
    data: logs,
    isLoading,
    error,
  } = useGetCronJobLogs({
    id,
    meta: query,
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  const from = location.pathname;

  return (
    <PageLayout>
      <header className='justify-between flex items-center'>
        <div
          className='flex gap-1 mb-6 items-start'
          title={`Real time status: ${
            wsState.isConnected ? 'Connected' : 'Disconnected'
          }`}
        >
          <PageHeading>Cron Job Logs</PageHeading>
          {/* Live Indicator */}
          <div
            className={cn('rounded-full h-2 w-2', {
              'bg-success': wsState.isConnected,
              'bg-destructive': !wsState.isConnected,
            })}
          ></div>
        </div>
      </header>
      <Link to='/dashboard' state={{ from }}>
        <Button className='mb-4' size={isDesktop ? 'default' : 'icon'}>
          <ArrowLeft className='sm:mr-2 h-4 w-4' />{' '}
          <span className='sm:block hidden'>Back to Dashboard</span>
        </Button>
      </Link>

      {/* charts */}
      <div className='grid gap-4 mb-6'>
        <Card>
          <CardHeader>
            <CardTitle>Execution Time Chart</CardTitle>
            <CardDescription>
              View execution times for this cron job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='metrics'>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>Total Executions:</span>{' '}
                <span className='font-semibold'>{logs?.data?.length}</span>
                <span className='text-muted-foreground'>/</span>
                <span className='text-muted-foreground'>
                  {logs?.meta?.total}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground'>Average Duration:</span>{' '}
                {calculateAverageJobExecutionTime(logs?.data)}
                ms
              </div>
              <div>
                <span className='text-muted-foreground'>Last Execution:</span>{' '}
                {logs?.data?.[0]?.executedAt &&
                  format(
                    new Date(logs?.data?.[0]?.executedAt),
                    'MM/dd/yyyy HH:mm:ss'
                  )}
              </div>
              <div>
                <span className='text-muted-foreground'>
                  Longest Execution Time:
                </span>{' '}
                {calculateLongestExecutionTime(logs?.data)}
                ms
              </div>
            </div>
            {logs?.data && (
              <AreaChart
                data={prepareChartData(logs?.data)}
                categories={['duration']}
                index='executedAt'
                onValueChange={(value) => console.log(value)}
                valueFormatter={(value) => `${value} ms`}
                className='h-80 w-full'
                intervalType='preserveStartEnd'
                yAxisWidth={50}
                autoMinValue
                curveType='linear'
                colors={['primary']}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Execution Status Chart</CardTitle>
            <CardDescription>
              View execution status for this cron job
            </CardDescription>
          </CardHeader>
          {logs?.data && (
            <CardContent>
              <div className='metrics'>
                <div className='flex items-center gap-1'>
                  <span className='text-muted-foreground'>
                    Total Executions:
                  </span>{' '}
                  <span className='font-semibold'>{logs?.data?.length}</span>
                  <span className='text-muted-foreground'>/</span>
                  <span className='text-muted-foreground'>
                    {logs?.meta?.total}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Success Rate:</span>{' '}
                  {calculateSuccessRate(logs.data)}%
                </div>

                <div>
                  <span className='text-muted-foreground'>Last Execution:</span>{' '}
                  {logs.data?.[0]?.executedAt &&
                    format(
                      new Date(logs.data?.[0]?.executedAt),
                      'MM/dd/yyyy HH:mm:ss'
                    )}
                </div>
              </div>

              <BarChart
                data={prepareStatusBarChartData(logs?.data)}
                categories={['Success', 'Failure']}
                index='name'
                onValueChange={(value) => console.log(value)}
                className='h-80 w-full'
                intervalType='preserveStartEnd'
                yAxisWidth={50}
                autoMinValue
                colors={['success', 'destructive']}
              />
            </CardContent>
          )}
        </Card>
      </div>

      <Card className='mb-6 relative'>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div>
            <CardTitle>
              Logs for {logs?.data?.[0]?.cronJob?.name ?? 'Unknown'}
            </CardTitle>
            <CardDescription>
              View execution history and details for this cron job
            </CardDescription>
          </div>
          <FilterControls query={query} setQuery={setQuery} />
        </CardHeader>
        <CardContent className='max-h-[32rem] overflow-y-scroll'>
          <Table>
            <TableHeader className='sticky top-0'>
              <TableRow>
                <TableHead>Executed At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.data?.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <div className='flex items-center'>
                      <Clock className='mr-2 h-4 w-4 text-muted-foreground' />
                      {format(new Date(log.executedAt), 'MM/dd/yyyy HH:mm:ss')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'Success' ? 'success' : 'destructive'
                      }
                    >
                      {log.status === 'Success' ? (
                        <CheckCircle className='mr-1 h-3 w-3' />
                      ) : (
                        <XCircle className='mr-1 h-3 w-3' />
                      )}
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.duration}ms</TableCell>
                  <TableCell>
                    <CronJobCommandDialog cronJobLog={log} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <PaginationControls
          className='pt-4'
          currentPage={logs?.meta?.page ?? 1}
          totalPages={logs?.meta?.totalPages ?? 1}
          handlePagination={(page) => setQuery({ ...query, page })}
        />
      </Card>
    </PageLayout>
  );
};

function calculateAverageJobExecutionTime(data: ICronJobLog[] = []) {
  if (data.length === 0) return 0;
  return (
    data.reduce((acc, curr) => acc + curr.duration, 0) / data.length
  ).toFixed(2);
}

function calculateLongestExecutionTime(data: ICronJobLog[] = []) {
  if (data.length === 0) return 0;
  return Math.max(...data.map((log) => log.duration)).toFixed(2);
}

function calculateSuccessRate(data: ICronJobLog[] = []) {
  if (data.length === 0) return 0;
  return (
    (data.filter((log) => log.status === 'Success').length / data.length) *
    100
  ).toFixed(2);
}

function prepareChartData(data: ICronJobLog[]) {
  return data.map((item) => ({
    executedAt: format(new Date(item.executedAt), 'MM/dd/yyyy HH:mm:ss'),
    duration: item.duration,
  }));
}

function prepareStatusBarChartData(data: ICronJobLog[]) {
  // return the count of each status {type: 'Success', count: 10}

  const result = [
    {
      name: 'Result',
      Success: 0,
      Failure: 0,
    },
  ];

  data.forEach((item) => {
    if (item.status === 'Success') {
      result[0].Success += 1;
    } else {
      result[0].Failure += 1;
    }
  });

  return result;
}

function CronJobCommandDialog({ cronJobLog }: { cronJobLog: ICronJobLog }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size={'icon'}>
          <CodeIcon className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent
        className='max-w-3xl overflow-hidden'
        aria-label='Cron Job Command Dialog'
      >
        <DialogHeader>
          <DialogTitle>Job: {cronJobLog?.cronJob?.name}</DialogTitle>
          <DialogDescription>
            Executed At:{' '}
            {format(new Date(cronJobLog?.executedAt), 'MM/dd/yyyy HH:mm:ss')}
          </DialogDescription>
        </DialogHeader>
        <h3>Command:</h3>
        <SyntaxHighlighter
          className='bg-accent font-mono p-4 rounded-md'
          codeClassName='whitepsace-normal'
          language='shell'
          code={cronJobLog?.commandExecuted}
        />
        <h3>Result:</h3>
        <SyntaxHighlighter
          language='shell'
          className='bg-accent font-mono p-4 rounded-md'
          code={cronJobLog?.stdout ?? ''}
        />

        {cronJobLog?.stderr && (
          <>
            <h3>Stderr:</h3>
            <SyntaxHighlighter
              language='shell'
              className='bg-destructive/20 font-mono p-4 rounded-md'
              code={cronJobLog?.stderr}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PaginationControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  handlePagination: (page: number) => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  handlePagination,
  className,
  ...props
}: PaginationControlsProps) {
  const window_size = 5;
  const paginationPagesDisplay = () => {
    const pages = [];
    // calculate start and end of the window
    const halfWindow = Math.floor(window_size / 2);
    let start = currentPage - halfWindow;
    let end = currentPage + halfWindow;
    if (start < 1) {
      start = 1;
      end = Math.min(window_size, totalPages);
    }
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - window_size + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          size='icon'
          onClick={() => handlePagination(i)}
          className={cn(
            'transition-colors duration-200 ease-in-out select-none'
          )}
          variant={currentPage === i ? 'default' : 'secondary'}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  const handleFirstPage = () => handlePagination(1);
  const handleLastPage = () => handlePagination(totalPages);

  return (
    <div {...props} className={cn('', className)}>
      <section className='content-controls-page-info'>
        {totalPages > 1 && (
          <div className='content-controls flex justify-center gap-4'>
            <Button
              size='icon'
              variant='outline'
              onClick={handleFirstPage}
              className={cn({
                'opacity-50': currentPage === 1,
                hidden: totalPages < window_size || currentPage === 1,
              })}
              disabled={currentPage === 1}
            >
              <ChevronsLeftIcon size={16} />
            </Button>
            <Button
              size='icon'
              variant='outline'
              onClick={() => handlePagination(Math.max(currentPage - 1, 1))}
              className={cn({ 'opacity-50': currentPage === 1 })}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon size={16} />
            </Button>
            {paginationPagesDisplay()}
            <Button
              size='icon'
              variant='outline'
              onClick={() =>
                handlePagination(Math.min(currentPage + 1, totalPages))
              }
              className={cn({ 'opacity-50': currentPage === totalPages })}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon size={16} />
            </Button>
            <Button
              size='icon'
              variant='outline'
              onClick={handleLastPage}
              className={cn({
                'opacity-50': currentPage === totalPages,
                hidden: totalPages < window_size || currentPage === totalPages,
              })}
              disabled={currentPage === totalPages}
            >
              <ChevronsRightIcon size={16} />
            </Button>
          </div>
        )}
        <div className='content-page-info text-center text-xs my-4 text-foreground/50 select-none'>
          {totalPages === 0 ? (
            <p>No items found</p>
          ) : (
            <>
              <p>
                Page {currentPage} of {totalPages}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterControls({
  query,
  setQuery,
}: {
  query: LogQuery;
  setQuery: (query: LogQuery) => void;
}) {
  return (
    <div className='flex gap-4'>
      {/* <input
        type='text'
        value={query.search}
        onChange={(e) => setQuery({ ...query, search: e.target.value })}
        placeholder='Search...'
        className='input'
      /> */}
      <Select
        value={query.status}
        onValueChange={(value) =>
          setQuery({ ...query, status: value === 'All' ? '' : value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder='All' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='All'>All</SelectItem>
          <SelectItem value='Success'>Success</SelectItem>
          <SelectItem value='Failure'>Failure</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// function DisplayLogsRangeDate({ logs }: { logs: ICronJobLog[] }) {
//   return (
//     <div className='flex items-center'>
//       <Clock className='size-4 text-muted-foreground' />
//       {format(new Date(logs[0].executedAt), 'MM/dd/yyyy HH:mm:ss')}
//       <span className='mx-2'>-</span>
//       <Clock className='size-4 text-muted-foreground' />
//       {format(
//         new Date(logs[logs.length - 1].executedAt),
//         'MM/dd/yyyy HH:mm:ss'
//       )}
//     </div>
//   );
// }
