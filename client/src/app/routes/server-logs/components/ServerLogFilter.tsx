import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { FilterOptions } from '../types/logs';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { NativeDatepicker } from '@/components/ui/native-datepicker';

const LOG_LEVELS = ['[ERROR]', '[WARN]', '[INFO]', '[DEBUG]'];
interface ServerLogFilterProps extends React.HTMLProps<HTMLDivElement> {
  filter: FilterOptions;
  setFilter: (filter: FilterOptions) => void;
}
export const ServerLogFilter = ({
  filter,
  setFilter,
  className,
  ...props
}: ServerLogFilterProps) => {
  const [localFilter, setLocalFilter] = useState(filter);

  const handleApplyFilter = () => {
    setFilter(localFilter);
  };

  const handleLevelChange = (level: string) => {
    const newLevels = localFilter.levels.includes(level)
      ? localFilter.levels.filter((l) => l !== level)
      : [...localFilter.levels, level];
    setLocalFilter({ ...localFilter, levels: newLevels });
  };

  const handleClearAllFilters = () => {
    setLocalFilter({
      startDate: '',
      endDate: '',
      levels: [],
      message: '',
    });

    setFilter({
      startDate: '',
      endDate: '',
      levels: [],
      message: '',
    });
  };

  const isFilterActive =
    filter.startDate ||
    filter.endDate ||
    filter.levels.length > 0 ||
    filter.message;

  return (
    <div
      {...props}
      className={cn('space-y-4 p-4 bg-foreground/5 rounded-lg', className)}
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='startDate'>Start Date</Label>
          <NativeDatepicker
            id='startDate'
            value={localFilter.startDate}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, startDate: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor='endDate'>End Date</Label>
          <NativeDatepicker
            id='endDate'
            value={localFilter.endDate}
            onChange={(e) =>
              setLocalFilter({ ...localFilter, endDate: e.target.value })
            }
          />
        </div>
      </div>
      <div>
        <Label>Log Levels</Label>
        <div className='flex flex-wrap gap-2'>
          {LOG_LEVELS.map((level) => (
            <div key={level} className='flex items-center'>
              <Checkbox
                id={`level-${level}`}
                checked={localFilter.levels.includes(level)}
                onCheckedChange={() => handleLevelChange(level)}
              />
              <Label htmlFor={`level-${level}`} className='ml-2'>
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor='message'>Message</Label>
        <Input
          type='text'
          id='message'
          value={localFilter.message}
          onChange={(e) =>
            setLocalFilter({ ...localFilter, message: e.target.value })
          }
          placeholder='Filter by message content'
        />
      </div>
      <div className='flex items-center justify-between gap-4'>
        <Button onClick={handleApplyFilter}>Apply Filters</Button>
        {isFilterActive && (
          <Button variant='secondary' onClick={handleClearAllFilters}>
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
};
