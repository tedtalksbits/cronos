import React, { useState } from 'react';
import { LoginStep1, LoginStep2 } from './components/login/Steps';
import { Clock9Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginCredentials, LoginResponse } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
export interface StepProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  formData: {
    email: string;
    password: string;
    token: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
      token: string;
    }>
  >;
}
const STEPS = [
  {
    title: 'Step One',
    component: LoginStep1,
  },
  {
    title: 'Step Two',
    component: LoginStep2,
  },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, requestOTP } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [, setResponse] = useState<LoginResponse | null>(null);
  const [formData, setFormData] = React.useState<LoginCredentials>({
    email: '',
    password: '',
    token: '',
  });

  const from = location.state?.from?.pathname || '/';

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    await login(formData, (res) => {
      setIsLoading(false);
      setResponse(res);

      if (res.status === 200) {
        // Redirect to dashboard
        navigate(from, { replace: true });
      } else {
        toast.error(res.message);
      }
    });
  }
  const handleNext = async () => {
    await requestOTP(formData.email, (res) => {
      if (res.status !== 200) {
        toast.error(res.message);
      }
      if (res.status === 200) {
        toast.success(res.message);

        if (currentStep < STEPS.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    });
  };
  const handlePrev = () => {
    currentStep > 0 && setCurrentStep(currentStep - 1);
  };
  return (
    <div className='mx-auto max-w-[450px] space-y-6'>
      <div className='bg-card rounded-b-md p-4 relative'>
        <p
          className='text-sm text-muted-foreground text-center'
          style={{ fontSize: '0.7rem' }}
        >
          You must log in to access {from}
        </p>
      </div>

      <header className='space-y-2 text-center my-16'>
        <div className='flex items-center justify-center'>
          <Clock9Icon className='size-6 mr-2' />
          <span className='text-2xl font-bold'>Chronos</span>
        </div>
        <h1 className='text-2xl font-semibold tracking-tight'>Sign in</h1>
        <p className='text-sm text-muted-foreground'>
          Fill in the form below to sign in
        </p>
      </header>

      <div
        className={cn('grid gap-4 bg-card border border-border p-4 rounded-md')}
      >
        {STEPS[currentStep].component({
          currentStep,
          setCurrentStep,
          isLoading,
          formData,
          setFormData,
        })}
        <div className='grid gap-4 '>
          {currentStep < STEPS.length - 1 ? (
            <div className='grid gap-2 grid-cols-2'>
              <div className='spacer' />
              <Button
                type='button'
                variant='outline'
                disabled={
                  isLoading || formData.email === '' || formData.password === ''
                }
                className='col-span-1'
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          ) : (
            <div className='flex gap-2 justify-between items-center'>
              <Button
                type='button'
                disabled={isLoading}
                className='w-full'
                onClick={handlePrev}
                variant={'outline'}
              >
                Previous
              </Button>
              <Button
                disabled={isLoading}
                className='w-full'
                onClick={onSubmit}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </div>
          )}
        </div>
        {/* <footer>
          <p className='text-center text-sm text-muted-foreground'>
            Don't have an account?{' '}
            <Button
              variant='link'
              onClick={() => navigate('/register')}
              className='text-primary'
            >
              Sign up
            </Button>
          </p>
        </footer> */}
      </div>
    </div>
  );
};

export default Login;
