import { useContext } from 'react';
import { SidebarContext } from '../providers/sidebarProvider';

export const useSidebar = () => {
  if (!SidebarContext) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }

  return useContext(SidebarContext);
};
