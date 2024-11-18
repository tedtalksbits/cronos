import PageHeader from '@/app/components/app-header';
import SideNav from '@/app/components/side-nav';
import { SidebarProvider } from '../../../providers/sidebarProvider';
import { Outlet } from 'react-router-dom';
import { BREAK_POINTS, useMediaQuery } from '@/hooks/utils/useMediaQuery';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const isDesktop = useMediaQuery(BREAK_POINTS.md);
  return (
    <SidebarProvider>
      <main
        className={cn('', {
          'app grid h-[100dvh] overflow-hidden transition-all ease-in-out duration-300 grid-cols-[0px_auto] [&:has(#sidebar[data-open=true])]:grid-cols-[300px_auto]':
            isDesktop,

          app: !isDesktop,
        })}
      >
        {isDesktop && <SideNav />}

        <section className='app-contentflex flex-col overflow-y-auto relative'>
          <PageHeader />
          <Outlet />
        </section>
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
