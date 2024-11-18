import { PageLayout } from '@/app/components/layouts/page-layout';
import { PageHeading } from '@/app/components/page-heading';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import createDialog from '@/components/ui/createDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  CronJobWebHook,
  useCreateCronJobWebHook,
  useDeleteCronJobWebHook,
  useGetCronJob,
  useUpdateCronJobWebHook,
} from '@/hooks/useCronJobs';
import { cn } from '@/lib/utils';
import {
  Edit2Icon,
  FileKeyIcon,
  Link2,
  ListRestartIcon,
  NotepadTextIcon,
  Plus,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export const Webhooks = () => {
  const { id } = useParams();
  const { data: cronJob, isLoading } = useGetCronJob(id as string);
  const [webhook, setWebhook] = useState<Partial<CronJobWebHook>>({
    event: 'job_started',
    url: '',
  });
  const { mutateAsync: addWebhook, isPending: isAddWebhookPending } =
    useCreateCronJobWebHook();

  const { mutateAsync: deleteWebhook, isPending: isDeleteWebhookPending } =
    useDeleteCronJobWebHook();

  const { mutateAsync: updateWebhook, isPending: isUpdateWebhookPending } =
    useUpdateCronJobWebHook();

  const [showForm, setShowForm] = useState<'none' | 'add' | 'edit'>('none');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  async function hanldeAddWebhook() {
    if (!cronJob?.data?._id || !webhook.url) {
      return toast.error('Please provide a valid URL');
    }

    const res = await addWebhook({ cronJobId: cronJob.data._id, webhook });

    if (res.status === 201) {
      setWebhook({ event: 'job_started', url: '' });
      toast.success('Webhook added successfully');
    } else {
      toast.error('Failed to add webhook');
    }

    setShowForm('none');
  }

  async function handleDeleteWebhook({
    cronJobId,
    webhookId,
  }: {
    cronJobId: string;
    webhookId: string;
  }) {
    if (!cronJobId || !webhookId) {
      return toast.error('Invalid request');
    }
    const confirm = await createDialog({
      title: 'Delete Webhook',
      details: 'Are you sure you want to delete this webhook?',
    });

    if (!confirm) {
      return;
    }

    const res = await deleteWebhook({ cronJobId, webhookId });

    if (res.status === 200) {
      toast.success('Webhook deleted successfully');
    } else {
      toast.error('Failed to delete webhook');
    }
  }

  async function handleUpdateWebhook({
    cronJobId,
    webhook,
  }: {
    cronJobId: string;
    webhook: Partial<CronJobWebHook>;
  }) {
    if (!cronJobId || !webhook.url || !webhook._id) {
      return toast.error('Invalid request');
    }
    const res = await updateWebhook({ cronJobId, webhook });

    if (res.status === 201) {
      setWebhook({ event: 'job_started', url: '' });
      toast.success('Webhook updated successfully');
    } else {
      toast.error('Failed to update webhook');
    }

    setShowForm('none');
  }

  return (
    <PageLayout>
      <PageHeading>
        Webhooks - <em>{cronJob?.data?.name}</em>
      </PageHeading>

      <small className='text-foreground/50'>
        Webhooks allow external services to be notified when certain events
        happen. When the specified events happen, we'll send a POST request to
        each of the URLs you provide.
      </small>
      <div className='mt-8'>
        <Card className='mb-6'>
          <CardHeader className='flex flex-row justify-between items-baseline'>
            <div>
              <CardTitle>Add New Webhook</CardTitle>
              <CardDescription>
                Enter the URL and select an event to trigger the webhook.
              </CardDescription>
            </div>

            <Button
              variant='outline'
              onClick={() => {
                setShowForm(showForm === 'add' ? 'none' : 'add');
                //clear the form
                setWebhook({ event: 'job_started', url: '' });
              }}
            >
              {showForm === 'add' ? 'Cancel' : 'New Webhook'}
            </Button>
          </CardHeader>
          {showForm === 'add' && (
            <>
              <CardContent>
                <WebhookForm webhook={webhook} setWebhook={setWebhook} />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={hanldeAddWebhook}
                  disabled={isAddWebhookPending}
                >
                  <Plus className='mr-2 h-4 w-4' /> Add Webhook
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <ul className='space-y-2'>
          <header>
            <h3 className='text-lg font-bold'>
              All Webhooks ({cronJob?.data?.webhooks.length})
              {cronJob?.data?.webhooks.length === 0 && (
                <small className='text-foreground/50'>
                  No webhooks added yet
                </small>
              )}
            </h3>
          </header>
          {cronJob?.data?.webhooks.map((wh) => (
            <li
              key={wh._id}
              className='p-4 border border-border rounded-md  bg-card'
            >
              <div className='flex justify-between items-start'>
                <CronJobWebhook webhook={wh} />
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => {
                      setWebhook(wh);
                      setShowForm(showForm === 'edit' ? 'none' : 'edit');
                    }}
                  >
                    <Edit2Icon className='size-4' />
                  </Button>

                  <Button
                    variant='destructive'
                    size='icon'
                    onClick={() =>
                      cronJob.data?._id &&
                      wh._id &&
                      handleDeleteWebhook({
                        cronJobId: cronJob.data._id,
                        webhookId: wh._id,
                      })
                    }
                    disabled={isDeleteWebhookPending}
                  >
                    <Trash2Icon className='size-4' />
                  </Button>
                </div>
              </div>
              {showForm === 'edit' && (
                <div>
                  <WebhookForm
                    className='my-8'
                    webhook={webhook}
                    setWebhook={setWebhook}
                  />
                  <Button
                    onClick={() =>
                      handleUpdateWebhook({
                        cronJobId: cronJob?.data?._id as string,
                        webhook,
                      })
                    }
                    disabled={isUpdateWebhookPending}
                  >
                    <Edit2Icon className='mr-2 h-4 w-4' /> Update Webhook
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </PageLayout>
  );
};

interface WebhookFormProps extends React.HTMLProps<HTMLDivElement> {
  webhook: Partial<CronJobWebHook>;
  setWebhook: (webhook: Partial<CronJobWebHook>) => void;
}
function WebhookForm({
  webhook,
  setWebhook,
  className,
  ...props
}: WebhookFormProps) {
  return (
    <div {...props} className={cn('grid gap-4', className)}>
      <div className='grid gap-2'>
        <Label htmlFor='url'>Webhook URL</Label>
        <Input
          id='url'
          placeholder='https://example.com/webhook'
          value={webhook.url}
          onChange={(e) => setWebhook({ ...webhook, url: e.target.value })}
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='event'>Event</Label>
        <Select
          value={webhook.event}
          onValueChange={(v) =>
            setWebhook({
              ...webhook,
              event: v as 'job_started' | 'job_succeeded' | 'job_failed',
            })
          }
        >
          <SelectTrigger id='event'>
            <SelectValue placeholder='Select an event' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='job_started'>Job Started</SelectItem>
            <SelectItem value='job_succeeded'>Job Succeeded</SelectItem>
            <SelectItem value='job_failed'>Job Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='secret'>Secret</Label>
        <Input
          id='secret'
          placeholder=''
          value={webhook.secret}
          onChange={(e) => setWebhook({ ...webhook, secret: e.target.value })}
        />
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          placeholder='Optional'
          value={webhook.description}
          onChange={(e) =>
            setWebhook({ ...webhook, description: e.target.value })
          }
          cols={30}
        />
      </div>
    </div>
  );
}

interface CronJobWebhookProps extends React.HTMLProps<HTMLDivElement> {
  webhook: CronJobWebHook;
}

const CronJobWebhook = ({
  webhook,
  className,
  ...props
}: CronJobWebhookProps) => {
  const [showSecret, setShowSecret] = useState(false);
  return (
    <div {...props} className={cn('', className)}>
      <div className='flex gap-2'>
        <span className='text-foreground/70 flex items-center w-[20ch]'>
          <Link2 className='mr-2 h-4 w-4' />
          URL
        </span>
        <span className='link text-info'>{webhook.url}</span>
      </div>
      <div className='flex gap-2'>
        <span className='text-foreground/70 flex items-center w-[20ch]'>
          <ListRestartIcon className='mr-2 h-4 w-4' />
          Event
        </span>
        <span className='flex items-center gap-1'>
          <span className='h-1 w-1 rounded-full bg-info' />
          <em className='text-foreground/90'>{webhook.event}</em>
        </span>
      </div>
      <div className='flex gap-2'>
        <span className='text-foreground/70 flex items-center w-[20ch]'>
          <NotepadTextIcon className='mr-2 h-4 w-4' />
          Description
        </span>
        <span className='text-foreground/90'>{webhook.description}</span>
      </div>
      <div className='flex gap-2'>
        <span className='text-foreground/70 flex items-center w-[20ch]'>
          <FileKeyIcon className='mr-2 h-4 w-4' />
          Secret
        </span>
        <span
          className='text-foreground/90 cursor-pointer'
          onClick={() => setShowSecret(!showSecret)}
        >
          {showSecret ? webhook.secret : '********'}
        </span>
      </div>
      {/* <div className='grid grid-cols-2'>
            <span className='text-foreground/70'>Created</span>
            <span className='text-foreground/90'>
              {webhook.createdAt &&
                formatDistanceToNow(new Date(webhook.createdAt), {
                  addSuffix: true,
                })}
            </span>
          </div>
          <div className='grid grid-cols-2'>
            <span className='text-foreground/70'>Updated</span>
            <span className='text-foreground/90'>
              {webhook.updatedAt &&
                formatDistanceToNow(new Date(webhook.updatedAt), {
                  addSuffix: true,
                })}
            </span>
          </div> */}
    </div>
  );
};
