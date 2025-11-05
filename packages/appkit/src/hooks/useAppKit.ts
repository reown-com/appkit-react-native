import { useMemo } from 'react';
import type { ChainNamespace } from '@reown/appkit-common-react-native';

import type { AppKit } from '../AppKit';
import { useAppKitContext } from './useAppKitContext';

/**
 * Interface representing the return value of the useAppKit hook
 */
interface UseAppKitReturn {
  /** Function to open the AppKit modal with optional view configuration */
  open: AppKit['open'];
  /** Function to close the AppKit modal */
  close: AppKit['close'];
  /** Function to disconnect the wallet, optionally scoped to a specific namespace */
  disconnect: (namespace?: ChainNamespace) => void;
  /** Function to switch to a different network */
  switchNetwork: AppKit['switchNetwork'];
}

/**
 * Hook to access core AppKit functionality for controlling the modal
 *
 * @remarks
 * This hook provides access to the main AppKit instance methods for opening/closing
 * the modal, disconnecting wallets, and switching networks. All functions are memoized
 * and properly bound to ensure stable references across renders.
 *
 * @returns {UseAppKitReturn} An object containing:
 *   - `open`: Opens the AppKit modal, optionally with a specific view
 *   - `close`: Closes the AppKit modal
 *   - `disconnect`: Disconnects the current wallet connection (optionally for a specific namespace)
 *   - `switchNetwork`: Switches to a different blockchain network
 *
 * @throws {Error} If used outside of an AppKitProvider
 * @throws {Error} If AppKit instance is not available in context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { open, close, disconnect, switchNetwork } = useAppKit();
 *
 *   return (
 *     <View>
 *       <Button onPress={() => open()} title="Connect Wallet" />
 *       <Button onPress={() => disconnect()} title="Disconnect" />
 *       <Button
 *         onPress={() => switchNetwork('eip155:1')}
 *         title="Switch to Ethereum"
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export const useAppKit = (): UseAppKitReturn => {
  const context = useAppKitContext();

  const stableFunctions = useMemo(() => {
    if (!context.appKit) {
      throw new Error('AppKit instance is not available');
    }

    return {
      open: context.appKit.open.bind(context.appKit),
      close: context.appKit.close.bind(context.appKit),
      disconnect: (namespace?: ChainNamespace) =>
        context.appKit!.disconnect.bind(context.appKit!)(namespace),
      switchNetwork: context.appKit.switchNetwork.bind(context.appKit)
    };
  }, [context.appKit]);

  return stableFunctions;
};
