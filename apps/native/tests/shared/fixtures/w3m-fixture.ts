/* eslint no-console: 0 */

import { ModalPage } from '../pages/ModalPage';
import { timeStart, timeEnd } from '../utils/logs';
import { timingFixture } from './timing-fixture';

// Declare the types of fixtures to use
export interface ModalFixture {
  modalPage: ModalPage;
  library: string;
}

// M -> test Modal
export const testM = timingFixture.extend<ModalFixture>({
  modalPage: async ({ page }, use) => {
    timeStart('new ModalPage');
    const modalPage = new ModalPage(page);
    timeEnd('new ModalPage');
    timeStart('modalPage.load');
    await modalPage.load();
    timeEnd('modalPage.load');
    await use(modalPage);
  }
});

export const testMSiwe = timingFixture.extend<ModalFixture>({
  modalPage: async ({ page }, use) => {
    const modalPage = new ModalPage(page);
    await modalPage.load();
    await use(modalPage);
  }
});

export { expect } from '@playwright/test';
