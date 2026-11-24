import type { Event } from '@reown/appkit-common-react-native';
import { EventsController } from '../../index';

// -- Setup --------------------------------------------------------------------
const event: Event = { type: 'track', event: 'MODAL_CLOSE', properties: { connected: false } };

// -- Tests --------------------------------------------------------------------

describe('EventsController', () => {
  it('should have valid default state', () => {
    expect(EventsController.state.data).toEqual({
      type: 'track',
      event: 'MODAL_CREATED'
    });
  });

  it('should update state correctly on sendEvent()', () => {
    EventsController.sendEvent(event);
    expect(EventsController.state.data).toEqual(event);
  });

  it('should notify subscribe() once per sendEvent() with the new data and timestamp', async () => {
    const calls: { event: string; timestamp: number }[] = [];
    const unsubscribe = EventsController.subscribe(state => {
      calls.push({ event: state.data.event, timestamp: state.timestamp });
    });

    await EventsController.sendEvent({
      type: 'track',
      event: 'MODAL_OPEN',
      properties: { connected: false }
    });
    unsubscribe();

    expect(calls).toEqual([{ event: 'MODAL_OPEN', timestamp: EventsController.state.timestamp }]);
  });

  it('should notify subscribeEvent() once when the same event object is sent again', async () => {
    await EventsController.sendEvent(event);

    const callback = jest.fn();
    const unsubscribe = EventsController.subscribeEvent('MODAL_CLOSE', callback);

    await EventsController.sendEvent(event);
    unsubscribe();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not notify subscribers for wallet impressions that are only queued', () => {
    const callback = jest.fn();
    const unsubscribe = EventsController.subscribe(callback);

    EventsController.trackWalletImpression({
      wallet: { id: 'wallet-id', name: 'Wallet' },
      view: 'Connect',
      displayIndex: 0
    });
    unsubscribe();
    EventsController.resetState();

    expect(callback).not.toHaveBeenCalled();
  });
});
