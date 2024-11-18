import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BREAK_POINTS, useMediaQuery } from '@/hooks/utils/useMediaQuery';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  title: string;
  className?: string;
  open?: boolean;
}
function ResponsiveDialog({
  children,
  title,
  trigger,
  className,
  open: initialOpen,
}: ResponsiveDialogProps) {
  const [open, setOpen] = useState(initialOpen);
  const isDesktop = useMediaQuery(BREAK_POINTS.sm);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          className={cn('sm:max-w-[725px]', className)}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        className={cn('rounded-t-3xl min-h-[90dvh] flex flex-col', className)}
        side='bottom'
      >
        <SheetHeader className='text-left mb-8'>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        {children}
      </SheetContent>
    </Sheet>
  );
}

export { ResponsiveDialog };
