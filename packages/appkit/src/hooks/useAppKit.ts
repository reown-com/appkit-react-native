import { useContext } from 'react';
import type { AppKit } from '../AppKit';
import { AppKitContext } from '../AppKitContext';

interface UseAppKitReturn {
  open: AppKit['open'];
  close: AppKit['close'];
  disconnect: (namespace?: string) => void;
  switchNetwork: AppKit['switchNetwork'];
}

export const useAppKit = (): UseAppKitReturn => {
  const context = useContext(AppKitContext);

  if (context === undefined) {
    throw new Error('useAppKit must be used within an AppKitProvider');
  }
  if (!context.appKit) {
    // This might happen if the provider is rendered before AppKit is initialized
    throw new Error('AppKit instance is not yet available in context.');
  }

  return {
    open: context.appKit.open.bind(context.appKit),
    close: context.appKit.close.bind(context.appKit),
    disconnect: (namespace?: string) => context.appKit?.disconnect.bind(context.appKit)(namespace),
    switchNetwork: context.appKit.switchNetwork.bind(context.appKit)
  };
};
