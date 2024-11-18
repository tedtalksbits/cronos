'use client';

import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { NavItems } from './side-nav';
import { useState } from 'react';

export function DrawerNav() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onClose={() => setOpen(false)}>
      <DrawerTrigger asChild>
        <Button variant='outline' size='icon' onClick={() => setOpen(true)}>
          <MenuIcon className='size-6' />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='min-h-[calc(100vh-4rem)]'>
        {/* <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader> */}
        <div className='p-4 pb-0'>
          <NavItems onNavigate={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
