import { Event, EventsController } from '../../index';

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
});
