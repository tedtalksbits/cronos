import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CronJob } from '@/hooks/useCronJobs';
import React from 'react';
import cronstrue from 'cronstrue';
import { CircleIcon } from 'lucide-react';
import { useGetAllScripts } from '@/hooks/useScripts';
import { Switch } from '@/components/ui/switch';

const CRONSTATUS = ['Active', 'Inactive'] as CronJob['status'][];
interface CronJobFormProps {
  job: Partial<CronJob>;
  setJob: React.Dispatch<React.SetStateAction<Partial<CronJob>>>;
}
const CronJobForm = ({ job, setJob }: CronJobFormProps) => {
  const [isCustomSchedule, setIsCustomSchedule] = React.useState(false);
  const { data: scripts, isLoading } = useGetAllScripts();
  const [selectedScript, setSelectedScript] = React.useState<string | null>(
    null
  );
  return (
    <div className='grid gap-4 py-4'>
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='name' className='text-right'>
          Name
        </Label>
        <Input
          id='name'
          value={job.name}
          onChange={(e) => setJob({ ...job, name: e.target.value })}
          className='col-span-3'
        />
      </div>
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='customSchedule' className='text-right'>
          Custom Schedule?
        </Label>
        <Switch
          checked={isCustomSchedule}
          onCheckedChange={setIsCustomSchedule}
        />
      </div>
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='schedule' className='text-right'>
          Schedule
        </Label>
        {isCustomSchedule ? (
          <div className='col-span-3'>
            {/* <small className='text-xs block'>
              <code>minute hour day month week</code>
            </small> */}
            {job.schedule && (
              <a
                className='text-xs block underline my-2'
                href={createCrontapLink(job.schedule)}
                target='_blank'
                rel='noreferrer'
              >
                View on crontab.guru
              </a>
            )}
            <Input
              id='schedule'
              value={job.schedule}
              onChange={(e) => setJob({ ...job, schedule: e.target.value })}
            />
            <small>{job.schedule && parseCronExpression(job.schedule)}</small>
          </div>
        ) : (
          <>
            <Select
              value={job.schedule}
              onValueChange={(value) => setJob({ ...job, schedule: value })}
            >
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select schedule' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='* * * * *'>Every Minute</SelectItem>
                <SelectItem value='0 * * * *'>Hourly</SelectItem>
                <SelectItem value='0 0 * * *'>Daily</SelectItem>
                <SelectItem value='0 0 * * 0'>Weekly</SelectItem>
                <SelectItem value='0 0 1 * *'>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='status' className='text-right'>
          Status
        </Label>
        <Select
          value={job.status}
          defaultValue='Active'
          onValueChange={(value) => {
            const status = value as CronJob['status'];
            setJob({ ...job, status });
          }}
        >
          <SelectTrigger className='col-span-3'>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>
          <SelectContent>
            {CRONSTATUS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='command' className='text-right'>
          Command
        </Label>
        <Input
          id='command'
          value={job.command}
          onChange={(e) => setJob({ ...job, command: e.target.value })}
          className='col-span-3'
        />
      </div>
      <div className='flex items-center gap-4'>
        <div className='h-[1px] w-full bg-accent' />
        <p className='text-center'>or</p>
        <div className='h-[1px] w-full bg-accent' />
      </div>
      {/* select a script */}
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='script' className='text-right'>
          Script
        </Label>
        {isLoading && <CircleIcon className='animate-spin' />}
        <Select
          value={selectedScript ?? ''}
          onValueChange={(value) => {
            setSelectedScript(value);
            setJob({ ...job, command: `bash "${value}"` });
          }}
        >
          <SelectTrigger className='col-span-3'>
            <SelectValue placeholder='Select script' />
          </SelectTrigger>
          <SelectContent>
            {scripts?.data?.map((script) => (
              <SelectItem key={script._id} value={script.path}>
                <p className='truncate text-sm w-[40ch]'>
                  {script.name} -{' '}
                  <span className='text-foreground/50'>
                    {script.description}
                  </span>
                </p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

function parseCronExpression(schedule: string) {
  try {
    return cronstrue.toString(schedule);
  } catch (error) {
    console.error(error);
    return 'Invalid cron expression';
  }
}

function createCrontapLink(schedule: string) {
  const modifiedSchedule = schedule.replace(/\s/g, '+');
  return `https://tool.crontap.com/cronjob-debugger?cron=${modifiedSchedule}`;
}

export default CronJobForm;
