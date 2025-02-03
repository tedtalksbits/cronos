import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  classname?: string;
}
const PasswordInput = ({ classname, ...props }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className='relative'>
      <Input
        className={cn('', classname)}
        {...props}
        type={showPassword ? 'text' : 'password'}
      />
      <span className='password-toggle absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 h-10 cursor-pointer text-foreground/50'>
        {showPassword ? (
          <EyeClosedIcon onClick={() => setShowPassword(!showPassword)} />
        ) : (
          <EyeOpenIcon onClick={() => setShowPassword(!showPassword)} />
        )}
      </span>
    </div>
  );
};

export { PasswordInput };
