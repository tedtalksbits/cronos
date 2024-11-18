import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import React from 'react';

const CollapseTriggerVariants = cva(
  'flex items-center justify-between w-full px-4 py-4 text-sm font-medium text-left text-foreground bg-card hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive',
        outline: 'text-primary',
        secondary: 'text-secondary',
        ghost:
          'bg-transparent hover:bg-transparent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const CollapseTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> &
    VariantProps<typeof CollapseTriggerVariants>
>(({ className, ...props }, ref) => {
  // user is expected to set aria-labelledby which is the id of the target element
  const targetId = props['aria-labelledby'];
  if (!targetId) {
    console.warn(
      'aria-labelledby is required on CollapseTrigger component. It should be the id of the target element'
    );
  }
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    // toggle aria-expanded
    e.currentTarget.setAttribute(
      'aria-expanded',
      e.currentTarget.getAttribute('aria-expanded') === 'true'
        ? 'false'
        : 'true'
    );

    // remove border-bottom if collapsed
    if (e.currentTarget.getAttribute('aria-expanded') === 'true') {
      target.classList.remove('border-b');
    } else {
      target.classList.add('border-b');
    }
    // toggle max-height
    if (target.style.maxHeight) {
      target.style.maxHeight = '';
    } else {
      target.style.maxHeight = target.scrollHeight + 'px';
    }

    // rotate collapse icon
    const collapseIcon = e.currentTarget.querySelector('.collapse-icon');
    if (!collapseIcon) return;
    collapseIcon.classList.toggle('rotate-90');
  };

  return (
    <button
      aria-expanded='false'
      className={cn(CollapseTriggerVariants({ className, ...props }))}
      {...props}
      ref={ref}
      onClick={handleClick}
    >
      {props.children}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        width='24'
        height='24'
        className='collapse-icon transition-transform duration-150 ease-out transform'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      >
        <polyline points='9 18 15 12 9 6' />
      </svg>
    </button>
  );
});

CollapseTrigger.displayName = 'CollapseTrigger';

const CollapseContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => {
  if (!props.id) {
    console.warn(
      'id is required on CollapseContent component. It should be unique'
    );
  }
  return (
    <div
      className='transition-[max-height] duration-200 ease-out overflow-hidden max-h-0 py-0 border-b'
      {...props}
      ref={ref}
    >
      <div className={cn('py-4', className)}>{props.children}</div>
    </div>
  );
});

CollapseContent.displayName = 'CollapseContent';

const Collapse = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn('border border-border rounded-md', className)}
      {...props}
      ref={ref}
    />
  );
});

Collapse.displayName = 'Collapse';

export { Collapse, CollapseTrigger, CollapseContent };
