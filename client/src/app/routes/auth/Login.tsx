import React, { useState } from 'react';
import { LoginStep1, LoginStep2 } from './components/login/Steps';
import { Clock9Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginResponse } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
export interface StepProps {
  currentStep: number;
  isLoading: boolean;
  formData: {
    email: string;
    password: string;
    otp: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
      otp: string;
    }>
  >;
}
const STEPS = [
  {
    title: 'Request OTP',
    component: LoginStep1,
  },
  {
    title: 'Enter OTP',
    component: LoginStep2,
  },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = location.state;
  const currentStep = parseInt(searchParams.get('step') || '0', 10);
  const email = searchParams.get('email') || '';
  const { login, requestOTP } = useAuth();
  // const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [, setResponse] = useState<LoginResponse | null>(null);
  const [formData, setFormData] = React.useState<{
    email: string;
    password: string;
    otp: string;
  }>({
    email: email || '',
    password: '',
    otp: '',
  });

  const from = location.state?.from?.pathname || '/';

  const updateStep = (data: { step: string; email: string }) => {
    setSearchParams(data);
    location.state = { password: formData.password };
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    console.log('formData', formData);
    console.log('location state', urlState);
    await login(
      {
        email: formData.email,
        otp: formData.otp,
      },
      (res) => {
        setIsLoading(false);
        setResponse(res);

        if (res.status === 200) {
          // Redirect to dashboard
          navigate(from, { replace: true });
        } else {
          toast.error(res.message);
        }
      }
    );
  }
  const handleNext = async () => {
    await requestOTP(
      {
        email: formData.email,
        password: formData.password,
      },
      (res) => {
        if (res.status !== 200) {
          toast.error(res.message);
        }
        if (res.status === 200) {
          toast.success(res.message);

          if (currentStep < STEPS.length - 1) {
            updateStep({
              step: (currentStep + 1).toString(),
              email: formData.email,
            });
          }
        }
      }
    );
  };
  const handlePrev = () => {
    if (currentStep > 0) {
      updateStep({
        step: (currentStep - 1).toString(),
        email: formData.email,
      });
    }
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
          <span className='text-2xl font-bold'>Cronos</span>
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
