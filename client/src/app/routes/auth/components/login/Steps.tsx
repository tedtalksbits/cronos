import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { StepProps } from '../../Login';
import { PasswordInput } from '@/components/ui/password-input';

export const LoginStep1 = ({ isLoading, formData, setFormData }: StepProps) => {
  return (
    <div className='grid gap-4'>
      <div className='grid gap-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          value={formData.email}
          id='email'
          placeholder='m@example.com'
          type='email'
          autoCapitalize='none'
          autoComplete='email'
          autoCorrect='off'
          autoFocus
          disabled={isLoading}
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='password'>Password</Label>
        <PasswordInput
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          value={formData.password}
          id='password'
          placeholder='Enter your password'
          type='password'
          autoComplete='new-password'
          disabled={isLoading}
          required
        />
      </div>
    </div>
  );
};

export const LoginStep2 = ({ isLoading, formData, setFormData }: StepProps) => {
  return (
    <div>
      <h3 className='text-xl font-semibold tracking-tight mb-4'>
        Two-Factor Authentication
      </h3>
      <p className='text-sm text-muted-foreground mb-4'>
        A code has been sent to your email. Please enter it below.
      </p>
      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='code'>Code</Label>
          <InputOTP
            name='code'
            id='code'
            disabled={isLoading}
            maxLength={6}
            onChange={(value) => setFormData({ ...formData, otp: value })}
            value={formData.otp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
    </div>
  );
};
