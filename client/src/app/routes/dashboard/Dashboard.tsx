import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CronJob,
  useCreateCronJob,
  useDeleteCronJob,
  useGetCronJobs,
  useUpdateCronJob,
} from '@/hooks/useCronJobs';
import { DialogTitle } from '@radix-ui/react-dialog';
import {
  AlertCircle,
  BarChart2,
  Clock,
  Edit2,
  Plus,
  Terminal,
  Trash2,
  Webhook,
} from 'lucide-react';
import { useState } from 'react';
import CronJobForm from './components/CronJobForm';
import { toast } from 'sonner';
import { useWebSocket } from '../../../hooks/useCronJobsWS';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import createDialog from '@/components/ui/createDialog';
import SyntaxHighlighter from '@/components/ui/syntax-highlighter';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { PageLayout } from '@/app/components/layouts/page-layout';
import { PageHeading } from '@/app/components/page-heading';
import { LoadingPage } from '@/app/components/loading';
import { ErrorPage } from '@/app/components/error';
const { VITE_APP_WS_URL } = import.meta.env;
export const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Partial<CronJob>>({
    name: '',
    schedule: '',
    command: '',
  });
  const [newJob, setNewJob] = useState<Partial<CronJob>>({
    name: '',
    schedule: '',
    command: '',
  });
  const {
    data: jobs,
    isLoading: isCronJobsLoading,
    error: cronJobsError,
  } = useGetCronJobs();
  const { mutateAsync: addCronJob, isPending: isAddCronJobPending } =
    useCreateCronJob();
  const { mutateAsync: updateCronJob, isPending: isUpdateCronJobPending } =
    useUpdateCronJob();
  const { mutateAsync: deleteCronJob, isPending: isDeleteCronJobPending } =
    useDeleteCronJob();

  const { wsState } = useWebSocket(VITE_APP_WS_URL);

  const handleAddCronJob = async () => {
    console.log(newJob);
    if (!newJob.name || !newJob.schedule || !newJob.command) {
      toast.error('Please fill in all fields');
      return;
    }
    const res = await addCronJob(newJob as CronJob);
    setIsNewFormOpen(false);
    if (res.status === 201) {
      setNewJob({ name: '', schedule: '', command: '' });
      return toast.success('Job added successfully');
    }
    return toast.error('Failed to add job');
  };

  const updateJob = async () => {
    console.log(selectedJob);
    if (!selectedJob.name || !selectedJob.schedule || !selectedJob.command) {
      toast.error('Please fill in all fields');
      return;
    }

    const res = await updateCronJob(selectedJob as CronJob);
    setIsEditFormOpen(false);
    if (res.status === 200) {
      return toast.success('Job updated successfully');
    }
    return toast.error('Failed to update job');
  };

  const deleteJob = async (id: string) => {
    if (!id) {
      return;
    }

    const userConfirmed = await createDialog({
      title: 'Delete Job',
      details:
        'Are you sure you want to delete this job?\nThis action cannot be undone',
    });
    if (!userConfirmed) {
      return;
    }
    const res = await deleteCronJob(id);
    if (res.status === 200) {
      return toast.success('Job deleted successfully');
    } else {
      alert('Failed to delete job');
      return toast.error('Failed to delete job');
    }
  };

  const getStatusColor = (status: CronJob['status']) => {
    switch (status) {
      case 'Active':
        return 'text-green-600';
      case 'Inactive':
        return 'text-red-600';
    }
  };

  if (isCronJobsLoading) {
    return <LoadingPage />;
  }

  if (cronJobsError) {
    return <ErrorPage error={cronJobsError} />;
  }

  const from = location.pathname;

  return (
    <PageLayout>
      <div
        className='flex gap-1 mb-6 items-start'
        title={`Real time status: ${
          wsState.isConnected ? 'Connected' : 'Disconnected'
        }`}
      >
        <PageHeading>Cron Job Dashboard</PageHeading>
        {/* Live Indicator */}
        <div
          className={cn('rounded-full h-2 w-2', {
            'bg-success': wsState.isConnected,
            'bg-destructive': !wsState.isConnected,
          })}
        ></div>
      </div>
      <div className='grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Jobs</CardTitle>
            <BarChart2 className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{jobs?.data?.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Jobs</CardTitle>
            <Clock className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {jobs?.data?.filter((job) => job.status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inactive Jobs</CardTitle>
            <AlertCircle className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {jobs?.data?.filter((job) => job.status === 'Inactive').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Jobs</CardTitle>
            <Terminal className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {
                jobs?.data?.filter(
                  (job) => job.status !== 'Active' && job.status !== 'Inactive'
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='mb-6'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Cron Jobs</CardTitle>
          <Dialog
            open={isNewFormOpen}
            onOpenChange={(o) => setIsNewFormOpen(o)}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsNewFormOpen(true)}>
                <Plus className='mr-2 size-4' /> Add New Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Job</DialogTitle>
                <DialogDescription>
                  Fill in the form below to add a new cron job
                </DialogDescription>
              </DialogHeader>
              <CronJobForm job={newJob} setJob={setNewJob} />
              <DialogFooter>
                <Button
                  onClick={handleAddCronJob}
                  disabled={isAddCronJobPending}
                >
                  Add Cron Job
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Command</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs?.data?.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>
                    <Link to={`/${job._id}/logs`} state={{ from }}>
                      {job.name}
                    </Link>
                  </TableCell>
                  <TableCell>{job.schedule}</TableCell>
                  <TableCell className='max-w-[200px]'>
                    <SyntaxHighlighter
                      language='shell'
                      code={job.command}
                      className='text-xs'
                    />
                  </TableCell>
                  <TableCell>
                    {job.lastRun &&
                      format(new Date(job.lastRun), 'MM/dd/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {job.nextRun &&
                      format(new Date(job.nextRun), 'MM/dd/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${getStatusColor(job.status)}`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user?.role === 'Admin' && (
                      <div className='flex space-x-2'>
                        <Dialog
                          open={isEditFormOpen}
                          onOpenChange={(o) => setIsEditFormOpen(o)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              title='edit'
                              variant='outline'
                              size='icon'
                              onClick={() => {
                                setSelectedJob(job);
                                setIsEditFormOpen(true);
                              }}
                            >
                              <Edit2 className='size-4' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Update Cron Job: {job.name}
                              </DialogTitle>
                              <DialogDescription>
                                Fill in the form below to update the cron job
                              </DialogDescription>
                            </DialogHeader>

                            <CronJobForm
                              job={selectedJob}
                              setJob={setSelectedJob}
                            />

                            <DialogFooter>
                              <Button
                                onClick={updateJob}
                                disabled={isUpdateCronJobPending}
                              >
                                Update Cron Job
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Link
                          title='webhooks'
                          to={`/${job._id}/webhooks`}
                          state={{ from }}
                        >
                          <Button size='icon'>
                            <Webhook className='size-4' />
                          </Button>
                        </Link>
                        <Button
                          title='delete'
                          variant='destructive'
                          size='icon'
                          onClick={() => deleteJob(job._id)}
                          disabled={isDeleteCronJobPending}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
};
