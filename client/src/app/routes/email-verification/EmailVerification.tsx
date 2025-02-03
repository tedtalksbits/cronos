import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowLeft, InfoIcon, MailCheckIcon } from 'lucide-react';
type EmailVerificationParams = {
  status: string;
  title: string;
  description: string;
  suggestion: string;
};
import { useEffect } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract query parameters
  const queryStatus = searchParams.get('status');
  const queryTitle = searchParams.get('title');
  const queryDescription = searchParams.get('description');
  const querySuggestion = searchParams.get('suggestion');

  const locationState = location.state as EmailVerificationParams | undefined;

  // Remove query params from the URL but keep them in the component
  useEffect(() => {
    if (queryStatus && queryTitle) {
      navigate('/email-verification', {
        replace: true,
        state: {
          description: queryDescription || '',
          status: queryStatus,
          suggestion: querySuggestion || '',
          title: queryTitle,
        } as EmailVerificationParams,
      }); // Remove query params from URL
    }
  }, [queryStatus, queryTitle, navigate]);

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4 landing'>
      {locationState && (
        <Card className='max-w-md w-full'>
          <CardHeader className='text-center'>
            <div
              className={cn(
                'mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center',
                {
                  'bg-success/10': locationState.status === 'success',
                  'bg-destructive/10': locationState.status === 'error',
                  'bg-info/10': locationState.status === 'info',
                }
              )}
            >
              <CardIcon status={locationState.status} />
            </div>
            <CardTitle className='text-2xl font-bold'>
              {locationState.title}
            </CardTitle>
            <CardDescription>{locationState.description}</CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-sm text-foreground/60 mb-4'>
              {locationState.suggestion}
            </p>
            <Link
              to='/'
              className='text-sm text-foreground/50 hover:text-foreground mt-4 inline-flex items-center'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Return to Homepage
            </Link>
          </CardContent>
          {locationState.status === 'error' && (
            <CardFooter className='flex flex-col space-y-2'>
              <a
                href='mailto:tedaneblake@gmail.com'
                className='text-sm text-foreground/50 hover:text-foreground'
              >
                <Button variant='outline' className='w-full'>
                  Contact Support
                </Button>
              </a>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

const CardIcon = ({ status }: { status: string }) => {
  if (status === 'success') {
    return <MailCheckIcon className='w-6 h-6 text-success' />;
  } else if (status === 'error') {
    return <AlertCircle className='w-6 h-6 text-destructive' />;
  } else {
    return <InfoIcon className='w-6 h-6 text-info' />;
  }
};
