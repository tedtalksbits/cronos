import { cn } from '@/lib/utils';

interface PageHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function PageHeading({ children, ...props }: PageHeadingProps) {
  return (
    <h1 {...props} className={cn('text-2xl font-bold', props.className)}>
      {children}
    </h1>
  );
}
