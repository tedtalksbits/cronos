import React, { createContext, useState } from 'react';

export const SidebarContext = createContext({
  isOpen: false,
  toggleSidebar: () => {},
});

interface SidebarProviderProps {
  children: React.ReactNode;
}
export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
