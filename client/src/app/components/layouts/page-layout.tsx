import { cn } from '@/lib/utils';

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageLayout({ children, ...props }: PageLayoutProps) {
  return (
    <div
      {...props}
      className={cn('container p-4 pt-[4.5rem] sm:pt-4', props.className)}
    >
      {children}
    </div>
  );
}
