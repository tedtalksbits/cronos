import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/hooks/useSidebar';
import { LogOutIcon, SidebarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BREAK_POINTS, useMediaQuery } from '@/hooks/utils/useMediaQuery';
import { DrawerNav } from './drawer-nav';
export default function PageHeader() {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(BREAK_POINTS.md);

  const fromPath =
    typeof location.state?.from === 'string'
      ? location.state.from.replace('/', '')
      : ''; // Fallback to an empty string if not a valid string

  const breadcrumbs = new Set([fromPath, location?.pathname?.replace('/', '')]);

  return (
    <header
      className={cn(
        'border-b border-foreground/10 flex items-center sticky top-0 bg-background/95 h-16 shrink-0 gap-4 px-3 z-10 backdrop-blur-lg',
        {
          'shadow-sm fixed left-0 right-0': !isDesktop,
        }
      )}
    >
      {isDesktop ? (
        <>
          <Button
            aria-label='Toggle Sidebar'
            size='icon'
            onClick={toggleSidebar}
            variant={'outline'}
          >
            <SidebarIcon className='size-4' />
          </Button>
          <Separator orientation='vertical' className='h-4' />
        </>
      ) : (
        <DrawerNav />
      )}

      {/* <Breadcrumbs /> */}
      <nav className='flex items-center space-x-3'>
        {Array.from(breadcrumbs).map((crumb, idx) => (
          <div key={idx} className='flex space-x-2 items-center justify-center'>
            <Link
              to={`/${crumb}`}
              state={{ from: location.pathname }}
              title={crumb}
              className={cn('hover:text-foreground truncate max-w-[20ch]', {
                'text-foreground/50': location.pathname !== `/${crumb}`,
                'max-w-[10ch]': !isDesktop,
              })}
            >
              {crumb}
            </Link>
            {idx < breadcrumbs.size - 1 && (
              <span className='text-foreground/50'>/</span>
            )}
          </div>
        ))}
      </nav>
      {user && (
        <div className='flex items-center space-x-3 ml-auto'>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.firstName} />
                <AvatarFallback>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className='bg-secondary text-secondary-foreground'>
                <Button
                  className='w-full flex justify-between gap-2 items-center'
                  onClick={() =>
                    logout((res) => {
                      if (res) {
                        console.log('Logged out');
                        navigate('/login');
                      }
                    })
                  }
                >
                  Logout
                  <LogOutIcon className='size-4' />
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
