import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { StepProps } from '../../Register';
import { PasswordInput } from '@/components/ui/password-input';

export const RegisterStep1 = ({
  isLoading,
  formData,
  setFormData,
}: StepProps) => {
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

export const RegisterStep2 = ({
  isLoading,
  formData,
  setFormData,
}: StepProps) => {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className='grid gap-2'>
        <Label htmlFor='firstName'>First name</Label>
        <Input
          id='firstName'
          placeholder='John'
          disabled={isLoading}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          value={formData.firstName}
          required
        />
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='lastName'>Last name</Label>
        <Input
          id='lastName'
          placeholder='Doe'
          disabled={isLoading}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          value={formData.lastName}
          required
        />
      </div>
      <div className='grid gap-2 col-span-2'>
        <Label htmlFor='phone'>Phone number</Label>
        <Input
          id='phone'
          placeholder='(123) 456-7890'
          type='tel'
          autoComplete='tel'
          disabled={isLoading}
          required
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          value={formData.phone}
        />
      </div>
    </div>
  );
};
