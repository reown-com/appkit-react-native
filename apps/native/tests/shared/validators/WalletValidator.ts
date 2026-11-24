import { type Locator, type Page, expect } from '@playwright/test';
import { getMaximumWaitConnections } from '../utils/timeouts';

const MAX_WAIT = getMaximumWaitConnections();

export class WalletValidator {
  private gotoSessions: Locator;

  constructor(public page: Page) {
    this.gotoSessions = this.page.getByTestId('sessions');
  }

  loadNewPage(page: Page) {
    this.page = page;
    this.gotoSessions = this.page.getByTestId('sessions');
  }

  async expectConnected() {
    await expect(
      this.gotoSessions,
      'Approve screen should be closed and sessions tab visible'
    ).toBeVisible();
    await this.gotoSessions.click();
    await this.expectSessionCard({ visible: true });
  }

  async expectSessionCard({ visible = true }: { visible?: boolean }) {
    if (visible) {
      await expect(
        this.page.getByTestId('session-card').first(),
        'Session card should be visible'
      ).toBeVisible({
        timeout: MAX_WAIT
      });
    } else {
      await expect(
        this.page.getByTestId('session-card'),
        'Session card should not be visible'
      ).not.toBeVisible({
        timeout: MAX_WAIT
      });
    }
  }

  async expectDisconnected() {
    await this.gotoSessions.click();
    await expect(
      this.page.getByTestId('session-card'),
      'Session card should not be visible'
    ).not.toBeVisible({
      timeout: MAX_WAIT
    });
  }

  async expectSessionCount(count: number) {
    await this.gotoSessions.click();
    await expect(
      this.page.getByTestId('session-card'),
      `Wallet should have ${count} session(s)`
    ).toHaveCount(count, { timeout: MAX_WAIT });
  }

  /**
   * A duplicated request (e.g. from adapter listeners registered twice) shows up as a second
   * request modal right after the first one is handled.
   */
  async expectNoPendingRequest() {
    // Give a duplicated request time to arrive
    await this.page.waitForTimeout(3000);
    await expect(
      this.page.getByTestId('session-approve-button'),
      'Wallet should not have another pending request'
    ).toBeHidden();
  }

  async expectReceivedSign({ chainName = 'Ethereum' }) {
    await expect(
      this.page.getByTestId('session-approve-button'),
      'Session approve button should be visible'
    ).toBeVisible({
      timeout: MAX_WAIT
    });
    await expect(
      this.page.getByTestId('request-details-chain'),
      'Request details should contain chain name'
    ).toContainText(chainName);
  }
}
