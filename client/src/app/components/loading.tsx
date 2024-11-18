import { Clock12Icon } from 'lucide-react';
import { PageLayout } from './layouts/page-layout';

export function LoadingPage() {
  return (
    <PageLayout>
      <Clock12Icon className='animate-spin size-12 text-primary' />
      <p>Loading...</p>
    </PageLayout>
  );
}
