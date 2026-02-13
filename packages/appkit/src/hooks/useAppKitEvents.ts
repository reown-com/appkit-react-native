import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { EventsController, type EventsControllerState } from '@reown/appkit-core-react-native';
import { type EventName } from '@reown/appkit-common-react-native';
import { useAppKitContext } from './useAppKitContext';

/**
 * Hook to subscribe to all AppKit events
 *
 * @remarks
 * This hook provides reactive access to AppKit's event system, allowing you to
 * monitor all events that occur within the AppKit lifecycle (connections, disconnections,
 * network changes, etc.). The callback is invoked whenever a new event is emitted.
 *
 * @param callback - Optional callback function invoked when any event occurs
 *
 * @returns An object containing:
 *   - `data`: The most recent event data
 *   - `timestamp`: The timestamp of the most recent event
 *
 * @throws {Error} If used outside of an AppKitProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, timestamp } = useAppKitEvents((event) => {
 *     console.log('Event occurred:', event.data.event);
 *   });
 *
 *   return (
 *     <View>
 *       <Text>Last event: {data?.event}</Text>
 *       <Text>Time: {timestamp}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useAppKitEvents(callback?: (newEvent: EventsControllerState) => void) {
  useAppKitContext();
  const { data, timestamp } = useSnapshot(EventsController.state);

  useEffect(() => {
    const unsubscribe = EventsController.subscribe(newEvent => {
      callback?.(newEvent);
    });

    return () => {
      unsubscribe?.();
    };
  }, [callback]);

  return { data, timestamp };
}

/**
 * Hook to subscribe to a specific AppKit event
 *
 * @remarks
 * This hook allows you to listen for a specific event type rather than all events.
 * It's more efficient than `useAppKitEvents` when you only care about a particular event.
 *
 * @param event - The specific event name to subscribe to (e.g., 'MODAL_OPEN', 'CONNECT_SUCCESS')
 * @param callback - Callback function invoked when the specified event occurs
 *
 * @throws {Error} If used outside of an AppKitProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useAppKitEventSubscription('CONNECT_SUCCESS', (event) => {
 *     console.log('Wallet connected!', event.data);
 *   });
 *
 *   useAppKitEventSubscription('DISCONNECT_SUCCESS', (event) => {
 *     console.log('Wallet disconnected!', event.data);
 *   });
 *
 *   return <View>{/ Your component /}</View>;
 * }
 * ```
 */

export function useAppKitEventSubscription(
  event: EventName,
  callback: (newEvent: EventsControllerState) => void
) {
  useAppKitContext();

  useEffect(() => {
    const unsubscribe = EventsController?.subscribeEvent(event, callback);

    return () => {
      unsubscribe?.();
    };
  }, [callback, event]);
}
