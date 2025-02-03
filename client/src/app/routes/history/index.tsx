'use client';

import { useState } from 'react';
import { PageLayout } from '@/app/components/layouts/page-layout';
import { HistoryQueryParams, useGetHistory } from '@/hooks/useHistory';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Button } from '@/components/ui/button';
import {
  ArrowRightIcon,
  CalendarRangeIcon,
  FilterIcon,
  Loader2,
} from 'lucide-react';
import { NativeDatepicker } from '@/components/ui/native-datepicker';
import { Component1Icon, LightningBoltIcon } from '@radix-ui/react-icons';
import { IHistory } from './types';
import { cn } from '@/lib/utils';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const HistoryLogs = () => {
  const [query, setQuery] = useState<HistoryQueryParams>({
    page: 1,
    limit: 50,
    sortField: 'timestamp',
    sortOrder: 'desc',
    search: '',
    actionType: '',
    entityType: '',
    userId: '',
    startDate: format(startOfDay(new Date()), 'yyyy-MM-dd HH:mm:ss'),
    endDate: format(endOfDay(new Date()), 'yyyy-MM-dd HH:mm:ss'),
  });

  const { data, isLoading, isError } = useGetHistory(query);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  // Handle Filters
  const handleFilterChange = (field: string, value: string) => {
    setQuery((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  // Handle Pagination
  const nextPage = () => setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
  const prevPage = () =>
    setQuery((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }));

  if (isLoading) {
    return (
      <PageLayout>
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='animate-spin h-6 w-6 text-gray-500' />
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className='text-red-500 text-center'>
          Error fetching server logs
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className='space-y-6'>
        {/* Filters & Search */}
        <div className='flex flex-wrap gap-4'>
          <Input
            placeholder='Search logs...'
            value={query.search}
            onChange={handleSearchChange}
            className='w-64'
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button size='icon' variant='outline'>
                <FilterIcon className='size-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='p-4 space-y-4 w-full'>
              <div className='flex items-center gap-3'>
                <div className='border border-primary/50 rounded-md p-2 bg-primary/10'>
                  <LightningBoltIcon className='size-4 text-primary' />
                </div>
                <Select
                  onValueChange={(value) => {
                    handleFilterChange(
                      'actionType',
                      value === 'all' ? '' : value
                    );
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Action Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='created'>Created</SelectItem>
                    <SelectItem value='updated'>Updated</SelectItem>
                    <SelectItem value='deleted'>Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-3'>
                <div className='border border-sky-500/50 rounded-md p-2 bg-sky-500/10'>
                  <Component1Icon className='size-4 text-sky-500' />
                </div>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange(
                      'entityType',
                      value === 'all' ? '' : value
                    )
                  }
                >
                  <SelectTrigger className=''>
                    <SelectValue placeholder='Entity Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='CronJob'>CronJob</SelectItem>
                    <SelectItem value='User'>User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-3'>
                <div className='border border-gray-500/50 rounded-md p-2 bg-gray-500/10'>
                  <CalendarRangeIcon className='size-4 text-gray-500' />
                </div>
                <NativeDatepicker
                  id='startDate'
                  value={query.startDate}
                  onChange={(e) =>
                    handleFilterChange('startDate', e.target.value)
                  }
                />
                <NativeDatepicker
                  id='endDate'
                  value={query.endDate}
                  onChange={(e) =>
                    handleFilterChange('endDate', e.target.value)
                  }
                />
              </div>
              <div
                className='flex justify-between'
                style={{ marginTop: '3rem' }}
              >
                <Button onClick={() => setQuery({ ...query, page: 1 })}>
                  Apply Filters
                </Button>
                <Button
                  onClick={() =>
                    setQuery({
                      ...query,
                      page: 1,
                      actionType: '',
                      entityType: '',
                      startDate: '',
                      endDate: '',
                    })
                  }
                  variant='outline'
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <div className='flex items-center ml-auto'>
            <Checkbox
              id='include-bot'
              checked={query.includeBot}
              onCheckedChange={() =>
                setQuery((prev) => ({ ...prev, includeBot: !prev.includeBot }))
              }
            />
            <Label htmlFor='include-bot' className='ml-2'>
              Include Bot
            </Label>
          </div>
        </div>

        {/* History Table */}
        <div className='border rounded-lg overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleFilterChange('sortField', 'timestamp')}
                >
                  Timestamp{' '}
                  {query.sortField === 'timestamp'
                    ? query.sortOrder === 'asc'
                      ? '↑'
                      : '↓'
                    : ''}
                </TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((history) => (
                <TableRow key={history._id}>
                  <TableCell>
                    {new Date(history.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{history.actionType}</TableCell>
                  <TableCell>{history.entityType}</TableCell>
                  <TableCell>
                    {history.user
                      ? `${history.user.firstName} ${history.user.lastName}`
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <DiffViewer history={history} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex justify-between items-center mt-4'>
          <Button
            variant='outline'
            disabled={query.page === 1}
            onClick={prevPage}
          >
            Previous
          </Button>
          <span>
            Page {query.page} of {data?.meta?.totalPages || 1}
          </span>
          <Button
            variant='outline'
            disabled={query.page >= (data?.meta?.totalPages || 1)}
            onClick={nextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export const DiffViewer = ({ history }: { history: IHistory }) => {
  if (history.diff) {
    return (
      <div className='space-y-2'>
        {history.diff.map((d) => (
          <div key={d.field} className='flex items-center space-x-2'>
            <span className='font-semibold'>{history.user.firstName}</span>
            <span
              className={cn('border p-1 rounded-full text-xs', {
                'text-primary bg-primary/10 border-primary/20':
                  history.actionType === 'created',
                'text-yellow-600 bg-yellow-600/10 border-yellow-600/20':
                  history.actionType === 'updated',
                'text-destructive bg-destructive/10 border-destructive/20':
                  history.actionType === 'deleted',
              })}
            >
              {history.actionType}
            </span>
            <span className='font-semibold'>{history.entityType}'s</span>
            <span className='bg-accent p-1 border rounded-full text-xs'>
              {d.field}
            </span>
            <span className='text-destructive italic'>{d.oldValue}</span>
            <span>
              <ArrowRightIcon />
            </span>
            <span className='text-primary italic'>{d.newValue}</span>
          </div>
        ))}
      </div>
    );
  }
  if (history.actionType === 'created') {
    return (
      <div className='flex items-center space-x-2'>
        <span className='font-semibold'>{history.user.firstName}</span>
        <span
          className={cn(
            'font-semibold border p-1 rounded-full text-xs text-primary bg-primary/10 border-primary/20'
          )}
        >
          {history.actionType}
        </span>
        <span>a new</span>
        <span className='font-semibold'> {history.entityType}</span>
      </div>
    );
  }

  if (history.actionType === 'deleted') {
    return (
      <div className='flex items-center space-x-2'>
        <span className='font-semibold'>{history.user.firstName}</span>
        <span
          className={cn(
            'font-semibold border p-1 rounded-full text-xs text-destructive bg-destructive/10 border-destructive/20'
          )}
        >
          {history.actionType}
        </span>
        <span>a(n)</span>
        <span className='font-semibold'> {history.entityType}</span>
      </div>
    );
  }
};
