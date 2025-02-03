import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { Toaster } from 'sonner';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: (...args: Array<unknown>) => void;
};
const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className='flex flex-col items-center justify-center h-screen  p-4 landing'>
      <div className='bg-card p-6 rounded-lg shadow-lg text-center'>
        <h2 className='text-2xl font-bold mb-4'>Something went wrong</h2>
        <p className='text-foreground/80 mb-4'>{error.message}</p>
        {process.env.NODE_ENV === 'development' && (
          <div className='text-destructive'>
            <small className='mb-4'>{error.name}</small>
            <pre className='mb-4'>{error.stack}</pre>
          </div>
        )}
        <div className='flex gap-4 items-center'>
          <a href='/' className='block ml-auto'>
            <Button variant='secondary'>Go home</Button>
          </a>
          <Button onClick={resetErrorBoundary}>Try again</Button>
        </div>
      </div>
    </div>
  );
};
const LoadingScreen = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className='animate-spin' />
    </div>
  );
};
type AppProviderProps = {
  children: React.ReactNode;
};
export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
        <Toaster
          richColors
          toastOptions={{
            closeButton: true,
          }}
        />
      </ErrorBoundary>
    </React.Suspense>
  );
};
