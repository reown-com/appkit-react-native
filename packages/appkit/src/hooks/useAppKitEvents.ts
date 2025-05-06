import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import {
  EventsController,
  OptionsController,
  type EventName,
  type EventsControllerState
} from '@reown/appkit-core-react-native';

export function useAppKitEvents(callback?: (newEvent: EventsControllerState) => void) {
  const { projectId } = useSnapshot(OptionsController.state);
  const { data, timestamp } = useSnapshot(EventsController.state);

  if (!projectId) {
    throw new Error('Please call "createAppKit" before using "useAppKitEvents" hook');
  }

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
  const { projectId } = useSnapshot(OptionsController.state);
  if (!projectId) {
    throw new Error('Please call "createAppKit" before using "useAppKitEventSubscription" hook');
  }

  useEffect(() => {
    const unsubscribe = EventsController?.subscribeEvent(event, callback);

    return () => {
      unsubscribe?.();
    };
  }, [callback, event]);
}
