import React from 'react';
import { Input } from './input';
import { CalendarIcon } from 'lucide-react';

export interface NativeDatepickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const NativeDatepicker = ({ className, ...props }: NativeDatepickerProps) => {
  const endDateRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className='relative'>
      <Input
        ref={endDateRef}
        type='datetime-local'
        id='endDate'
        className={className}
        {...props}
      />
      <span className='absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 h-10 cursor-pointer text-foreground/50'>
        <CalendarIcon
          className='size-4'
          onClick={() => endDateRef.current?.showPicker()}
        />
      </span>
    </div>
  );
};

export { NativeDatepicker };
