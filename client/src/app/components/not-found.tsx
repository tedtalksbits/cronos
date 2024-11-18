import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className='flex flex-col landing'>
      <main className='flex-1'>
        <section className='w-full min-h-[80dvh] grid place-content-center'>
          <div className='px-4 md:px-6'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
                  Uh oh, this page doesn't exist!
                </h1>
                <p className='mx-auto max-w-[700px] text-foreground/50 md:text-xl'>
                  The page you're looking for doesn't exist. Please check the
                  URL and try again.
                </p>
              </div>
              <div className='space-x-4'>
                <Link to='/'>
                  <Button>
                    Home
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
