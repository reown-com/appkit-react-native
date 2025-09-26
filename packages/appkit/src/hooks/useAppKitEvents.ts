import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { EventsController, type EventsControllerState } from '@reown/appkit-core-react-native';
import { type EventName } from '@reown/appkit-common-react-native';
import { useAppKit } from './useAppKit';

export function useAppKitEvents(callback?: (newEvent: EventsControllerState) => void) {
  useAppKit(); // Use the hook for checks
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

export function useAppKitEventSubscription(
  event: EventName,
  callback: (newEvent: EventsControllerState) => void
) {
  useAppKit(); // Use the hook for checks

  useEffect(() => {
    const unsubscribe = EventsController?.subscribeEvent(event, callback);

    return () => {
      unsubscribe?.();
    };
  }, [callback, event]);
}
