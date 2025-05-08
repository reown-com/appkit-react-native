import React, { createContext, useContext, type ReactNode } from 'react';
import { AppKit } from './AppKit';

interface AppKitContextType {
  appKit: AppKit | null;
}

export const AppKitContext = createContext<AppKitContextType>({ appKit: null });

interface AppKitProviderProps {
  children: ReactNode;
  instance: AppKit;
}

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children, instance }) => {
  return <AppKitContext.Provider value={{ appKit: instance }}>{children}</AppKitContext.Provider>;
};

//TODO: rename this so it doesn't conflict with the useAppKit hook in the hooks folder
export const useAppKit = () => {
  const context = useContext(AppKitContext);
  if (context === undefined) {
    throw new Error('useAppKit must be used within an AppKitProvider');
  }
  if (!context.appKit) {
    // This might happen if the provider is rendered before AppKit is initialized
    throw new Error('AppKit instance is not yet available in context.');
  }

  return {
    connect: context.appKit.connect.bind(context.appKit),
    disconnect: context.appKit.disconnect.bind(context.appKit),
    open: context.appKit.open.bind(context.appKit),
    close: context.appKit.close.bind(context.appKit),
    switchNetwork: context.appKit.switchNetwork.bind(context.appKit),
    getProvider: context.appKit.getProvider.bind(context.appKit)
  };
};
