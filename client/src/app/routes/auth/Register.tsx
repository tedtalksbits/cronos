import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock9Icon } from 'lucide-react';
import { RegisterStep1, RegisterStep2 } from './components/register/Steps';
import { useAuth } from '@/hooks/useAuth';
import { RegisterResponse } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface StepProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone: string;
    }>
  >;
}
const STEPS = [
  {
    title: 'Step One',
    component: RegisterStep1,
  },
  {
    title: 'Step Two',
    component: RegisterStep2,
  },
];
const Register = () => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<RegisterResponse | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone
    ) {
      return;
    }

    await register(formData, (res) => {
      setIsLoading(false);
      setResponse(res);

      // display qrcode image
      if (res.status === 201) {
        toast.success('Account created successfully');

        // reset form data
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
        });
      } else {
        toast.error('An error occurred: ' + res.message);
      }
    });
  }

  return (
    <div className='mx-auto max-w-[450px] space-y-6'>
      <header className='space-y-2 text-center my-16'>
        <div className='flex items-center justify-center'>
          <Clock9Icon className='size-6 mr-2' />
          <span className='text-2xl font-bold'>Chronos</span>
        </div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {response?.status === 201
            ? 'Account requested!'
            : 'Create an account'}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {response?.status === 201
            ? 'An email has been sent to the server administrator for approval.'
            : 'Fill in the form below to create an account'}
        </p>
      </header>

      <div
        className={cn(
          'grid gap-4 bg-card p-4 rounded-md border border-border',
          {
            hidden: response?.status === 201,
          }
        )}
      >
        {STEPS[currentStep].component({
          currentStep,
          setCurrentStep,
          isLoading,
          formData,
          setFormData,
        })}
        <div className='grid gap-4'>
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
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          )}
        </div>
        <footer>
          <p className='text-center text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Button variant='link' className='text-primary' type='button'>
              <Link to='/login'>Login</Link>
            </Button>
          </p>
        </footer>
      </div>

      {response?.status === 201 && (
        <div className='grid gap-4 p-4 border bg-background rounded-lg shadow-lg text-center'>
          <h2 className='text-lg font-semibold'>Account request sent!</h2>

          <p className='text-sm text-muted-foreground'>
            An email has been sent to the server administrator for approval.
          </p>

          <Link to='/login'>
            <Button variant='outline' className='w-full'>
              Go to login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Register;
