import { APIError } from '@/lib/CustomError';
import { TriangleAlertIcon } from 'lucide-react';
import { PageLayout } from './layouts/page-layout';

export function ErrorPage({ error }: { error: APIError }) {
  return (
    <PageLayout>
      <div className='flex'>
        <TriangleAlertIcon className='size-12 text-destructive' />
      </div>
      <h3 className='text-xl font-mono'>Error: {error.status}</h3>
      <h1 className='text-4xl font-mono'>{error.message}</h1>
      <p className='text-foreground/50'>
        {error.status === 403 && <span>Access Denied</span>}
        {error.status === 404 && <span>Not Found</span>}
        {error.status === 500 && <span>Ouch!, something went wrong</span>}
      </p>
    </PageLayout>
  );
}
