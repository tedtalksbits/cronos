import { useSidebar } from '@/hooks/useSidebar';
import { useTheme } from '@/providers/themeProvider';
import {
  ChevronRightIcon,
  Clock9Icon,
  Code2Icon,
  DoorClosedIcon,
  History,
  Logs,
  MoonIcon,
  SunIcon,
  UserCircle2Icon,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { cn } from '@/lib/utils';

export default function SideNav() {
  const { isOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  return (
    <aside
      data-open={isOpen}
      className='border-r relative z-10 overflow-hidden transition-all ease-in-out duration-300'
      id='sidebar'
    >
      <div className='flex items-center justify-between px-3 border-b h-16'>
        <h3 className='logo font-black flex'>
          <Clock9Icon className='size-6 mr-2' />
          Cronos
        </h3>
        <Button
          size='icon'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <SunIcon className='size-4' />
          ) : (
            <MoonIcon className='size-4' />
          )}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </div>
      <nav className='flex flex-col gap-2 p-3'>
        <NavItems />
      </nav>
    </aside>
  );
}

export function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const from = location.pathname;
  return (
    <>
      <NavLink
        onClick={onNavigate}
        to='/dashboard'
        state={{ from }}
        className={({ isActive }) =>
          cn('flex items-center p-3 gap-4 hover:bg-card rounded-md', {
            'bg-accent': isActive,
            'text-foreground': !isActive,
          })
        }
      >
        <DoorClosedIcon className='size-4' />
        <span>Dashboard</span>
        <ChevronRightIcon
          className={cn(
            'size-4 transition-all ml-auto opacity-0 -translate-x-4',
            {
              'opacity-100 translate-x-0':
                location.pathname.includes('/dashboard'),
            }
          )}
        />
      </NavLink>
      <NavLink
        onClick={onNavigate}
        to='/scripts'
        state={{ from }}
        className={({ isActive }) =>
          cn('flex items-center p-3 gap-4 hover:bg-card rounded-md group', {
            'bg-accent': isActive,
            'text-foreground': !isActive,
            active: isActive,
          })
        }
      >
        <Code2Icon className='size-4' />
        <span>Script</span>

        <ChevronRightIcon
          className={cn(
            'size-4 transition-all ml-auto opacity-0 -translate-x-4',
            {
              'opacity-100 translate-x-0':
                location.pathname.includes('/scripts'),
            }
          )}
        />
      </NavLink>
      <NavLink
        onClick={onNavigate}
        to='/users'
        state={{ from }}
        className={({ isActive }) =>
          cn('flex items-center p-3 gap-4 hover:bg-card rounded-md group', {
            'bg-accent': isActive,
            'text-foreground': !isActive,
            active: isActive,
          })
        }
      >
        <UserCircle2Icon className='size-4' />
        <span>Users</span>

        <ChevronRightIcon
          className={cn(
            'size-4 transition-all ml-auto opacity-0 -translate-x-4',
            {
              'opacity-100 translate-x-0': location.pathname.includes('/users'),
            }
          )}
        />
      </NavLink>
      <NavLink
        onClick={onNavigate}
        to='/server-logs'
        state={{ from }}
        className={({ isActive }) =>
          cn('flex items-center p-3 gap-4 hover:bg-card rounded-md group', {
            'bg-accent': isActive,
            'text-foreground': !isActive,
            active: isActive,
          })
        }
      >
        <Logs className='size-4' />
        <span>Server Logs</span>

        <ChevronRightIcon
          className={cn(
            'size-4 transition-all ml-auto opacity-0 -translate-x-4',
            {
              'opacity-100 translate-x-0': location.pathname.includes('/users'),
            }
          )}
        />
      </NavLink>
      <NavLink
        onClick={onNavigate}
        to='/history'
        state={{ from }}
        className={({ isActive }) =>
          cn('flex items-center p-3 gap-4 hover:bg-card rounded-md group', {
            'bg-accent': isActive,
            'text-foreground': !isActive,
            active: isActive,
          })
        }
      >
        <History className='size-4' />
        <span>History</span>
        <ChevronRightIcon
          className={cn(
            'size-4 transition-all ml-auto opacity-0 -translate-x-4',
            {
              'opacity-100 translate-x-0': location.pathname.includes('/users'),
            }
          )}
        />
      </NavLink>
    </>
  );
}
