import React, { createContext, useContext, type ReactNode } from 'react';
import { AppKit } from './AppKit';

interface AppKitContextType {
  appKit: AppKit | null;
}

const AppKitContext = createContext<AppKitContextType>({ appKit: null });

interface AppKitProviderProps {
  children: ReactNode;
  instance: AppKit;
}

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children, instance }) => {
  return <AppKitContext.Provider value={{ appKit: instance }}>{children}</AppKitContext.Provider>;
};

export const useAppKit = (): { appKit: AppKit } => {
  const context = useContext(AppKitContext);
  if (context === undefined) {
    throw new Error('useAppKit must be used within an AppKitProvider');
  }
  if (!context.appKit) {
    // This might happen if the provider is rendered before AppKit is initialized
    throw new Error('AppKit instance is not yet available in context.');
  }

  return { appKit: context.appKit };
};
