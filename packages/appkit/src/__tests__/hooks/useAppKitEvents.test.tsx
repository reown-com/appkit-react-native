import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { EventsController, type EventsControllerState } from '@reown/appkit-core-react-native';
import type { Event } from '@reown/appkit-common-react-native';
import { useAppKitEvents, useAppKitEventSubscription } from '../../hooks/useAppKitEvents';
import { type AppKitContextType, AppKitContext } from '../../AppKitContext';
import type { AppKit } from '../../AppKit';

// These tests use the real EventsController and valtio, so the callbacks run exactly as they do
// in an app.

const connectSuccess: Event = {
  type: 'track',
  event: 'CONNECT_SUCCESS',
  properties: { name: 'MetaMask', method: 'mobile' }
};
const modalClose: Event = { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } };

// Copy what a callback sees, since it receives the live (mutable) controller state
const recordCalls = () => {
  const calls: { event: string; timestamp: number }[] = [];
  const callback = jest.fn((newEvent: EventsControllerState) => {
    calls.push({ event: newEvent.data.event, timestamp: newEvent.timestamp });
  });

  return { calls, callback };
};

describe('useAppKitEvents', () => {
  const mockAppKit = {} as AppKit;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    EventsController.resetState();
  });

  it('should throw error when used outside AppKitProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAppKitEvents());
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should return the latest event data and timestamp', async () => {
    const { result } = renderHook(() => useAppKitEvents(), { wrapper });

    expect(result.current.data.event).toBe('MODAL_CREATED');

    await act(async () => {
      await EventsController.sendEvent(modalClose);
    });

    expect(result.current.data).toEqual(modalClose);
    expect(result.current.timestamp).toBe(EventsController.state.timestamp);
  });

  it('should call the callback exactly once per event with the new data', async () => {
    const { calls, callback } = recordCalls();
    renderHook(() => useAppKitEvents(callback), { wrapper });

    await act(async () => {
      await EventsController.sendEvent(modalClose);
    });

    expect(calls).toEqual([{ event: 'MODAL_CLOSE', timestamp: EventsController.state.timestamp }]);
  });

  it('should stop calling the callback after unmount', async () => {
    const { callback } = recordCalls();
    const { unmount } = renderHook(() => useAppKitEvents(callback), { wrapper });

    unmount();

    await act(async () => {
      await EventsController.sendEvent(modalClose);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useAppKitEventSubscription', () => {
  const mockAppKit = {} as AppKit;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    EventsController.resetState();
  });

  it('should throw error when used outside AppKitProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAppKitEventSubscription('CONNECT_SUCCESS', jest.fn()));
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should call the callback exactly once with the new event data', async () => {
    const { calls, callback } = recordCalls();
    renderHook(() => useAppKitEventSubscription('CONNECT_SUCCESS', callback), { wrapper });

    await act(async () => {
      await EventsController.sendEvent(connectSuccess);
    });

    expect(calls).toEqual([
      { event: 'CONNECT_SUCCESS', timestamp: EventsController.state.timestamp }
    ]);
  });

  it('should call the callback once when the same event is sent again', async () => {
    await EventsController.sendEvent(connectSuccess);

    const { calls, callback } = recordCalls();
    renderHook(() => useAppKitEventSubscription('CONNECT_SUCCESS', callback), { wrapper });

    await act(async () => {
      await EventsController.sendEvent(connectSuccess);
    });

    expect(calls).toEqual([
      { event: 'CONNECT_SUCCESS', timestamp: EventsController.state.timestamp }
    ]);
  });

  it('should not call the callback for other events', async () => {
    const { callback } = recordCalls();
    renderHook(() => useAppKitEventSubscription('CONNECT_SUCCESS', callback), { wrapper });

    await act(async () => {
      await EventsController.sendEvent(modalClose);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should stop calling the callback after unmount', async () => {
    const { callback } = recordCalls();
    const { unmount } = renderHook(() => useAppKitEventSubscription('CONNECT_SUCCESS', callback), {
      wrapper
    });

    unmount();

    await act(async () => {
      await EventsController.sendEvent(connectSuccess);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
