import { useContext } from 'react';

import { AppKitContext, type AppKitContextType } from '../AppKitContext';

/**
 * Hook to access the AppKit context
 *
 * @remarks
 * This is an internal hook used by other AppKit hooks to ensure they're used within
 * the AppKitProvider. You typically don't need to use this hook directly - use the
 * higher-level hooks like `useAppKit`, `useAccount`, `useAppKitTheme`, etc. instead.
 *
 * @returns {AppKitContextType} The AppKit context containing the AppKit instance
 *
 * @throws {Error} If used outside of an AppKitProvider
 * @throws {Error} If the AppKit instance is not yet available in context
 *
 * @internal
 *
 * @example
 * ```tsx
 * // This is typically used internally by other hooks
 * function MyCustomHook() {
 *   const context = useAppKitContext();
 *   // Use context.appKit...
 * }
 * ```
 */

export const useAppKitContext = (): AppKitContextType => {
  const context = useContext(AppKitContext);

  if (context === undefined) {
    throw new Error('useAppKitContext must be used within an AppKitProvider');
  }

  if (!context.appKit) {
    // This might happen if the provider is rendered before AppKit is initialized
    throw new Error('AppKit instance is not yet available in context.');
  }

  return context;
};
