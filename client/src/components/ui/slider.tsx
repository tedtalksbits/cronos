import { cn } from '@/lib/utils';
import React, { useRef, useState } from 'react';

export interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showValue?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, showValue = true, ...props }, ref) => {
    const [value, setValue] = useState<number>(Number(props.value) || 0);
    const [, setIsSliding] = useState<boolean>(false);
    const sliderRef = useRef<HTMLInputElement | null>(null);

    // Update value when the slider changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsSliding(true);
      const newValue = Number(e.target.value);
      setValue(newValue);
      if (props.onChange) {
        props.onChange(e); // Call the original onChange if provided
      }
    };

    // Calculate the position of the value indicator
    const getValuePosition = () => {
      if (sliderRef.current) {
        const min = Number(props.min) || 0;
        const max = Number(props.max) || 100;
        const percentage = ((value - min) / (max - min)) * 100;
        return `calc(${percentage}% + 1px)`; // Adjust offset for center alignment
      }
      // use the value and the min and max to calculate the percentage

      const min = Number(props.min) || 0;
      const max = Number(props.max) || 100;
      const percentage = ((value - min) / (max - min)) * 100;
      return `calc(${percentage}% + 1px)`; // Adjust offset for center alignment
    };

    return (
      <div className='relative w-full my-4'>
        <div
          className={cn(
            'absolute transition-all duration-100 ease-linear tabular-nums'
          )}
          style={{
            left: getValuePosition(),
            top: -30,
            transform: 'translateX(-50%)',
          }}
        >
          <input
            type='number'
            className='text-center bg-input rounded-md text-base text-foreground focus:outline-none w-[7ch] pl-2 py-1'
            value={value}
            onChange={(e) => {
              const newValue = Number(e.target.valueAsNumber);
              setValue(newValue);
              if (props.onChange) {
                props.onChange(e); // Call the original onChange if provided
              }
            }}
          />
        </div>

        <input
          type='range'
          onPointerUp={async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            !showValue && setIsSliding(false);
          }}
          onBlur={async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            !showValue && setIsSliding(false);
          }}
          className={cn(
            'w-full h-2 appearance-none rounded-md bg-input focus:outline-none peer',
            className
          )}
          value={value}
          {...props}
          onChange={handleChange}
          ref={(node) => {
            sliderRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
        />
        {/* <input
          type='number'
          className='w-20 h-8 text-center bg-input rounded-md text-sm text-foreground focus:outline-none'
          value={value}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setValue(newValue);
            if (props.onChange) {
              props.onChange(e); // Call the original onChange if provided
            }
          }}
        /> */}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
