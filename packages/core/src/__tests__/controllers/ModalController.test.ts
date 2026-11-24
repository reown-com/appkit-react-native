import { resetControllers } from '@shared-jest-setup';
import { ModalController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  afterEach(() => {
    resetControllers();
  });

  it('should have valid default state', () => {
    expect(ModalController.state.open).toEqual(false);
  });

  it('should update state correctly on open()', async () => {
    await ModalController.open();
    expect(ModalController.state.open).toEqual(true);
  });

  it('should update state correctly on close()', async () => {
    await ModalController.open();
    ModalController.close();
    expect(ModalController.state.open).toEqual(false);
  });

  it('should shake for a moment and ignore shakes while shaking', () => {
    jest.useFakeTimers();

    ModalController.shake();
    expect(ModalController.state.shake).toEqual(true);

    ModalController.shake();
    jest.advanceTimersByTime(500);
    expect(ModalController.state.shake).toEqual(false);

    jest.useRealTimers();
  });
});
