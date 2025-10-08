import { type Page, expect } from '@playwright/test';
import { getMaximumWaitConnections } from '../utils/timeouts';

const MAX_WAIT = getMaximumWaitConnections();

export class ModalValidator {
  constructor(public readonly page: Page) {}

  async expectConnected() {
    const accountButton = this.page.getByTestId('account-button');
    await expect(accountButton, 'Account button should be present').toBeAttached({
      timeout: MAX_WAIT
    });
    await expect(
      this.page.getByTestId('connect-button'),
      'Connect button should not be present'
    ).toBeHidden({
      timeout: MAX_WAIT
    });
    await this.page.waitForTimeout(500);
  }

  async expectBalanceFetched(currency: 'SOL' | 'ETH') {
    const accountButton = this.page.getByTestId('account-button');
    await expect(accountButton, `Account button should show balance as ${currency}`).toContainText(
      `0.000 ${currency}`
    );
  }

  async expectAuthenticated() {
    await expect(
      this.page.getByTestId('w3m-authentication-status'),
      'Authentication status should be: authenticated'
    ).toContainText('authenticated');
  }

  async expectUnauthenticated() {
    await expect(
      this.page.getByTestId('w3m-authentication-status'),
      'Authentication status should be: unauthenticated'
    ).toContainText('unauthenticated');
  }

  async expectSignatureDeclined() {
    await expect(
      this.page.getByText('Signature declined'),
      'Signature declined should be visible'
    ).toBeVisible();
  }

  async expectDisconnected() {
    await expect(
      this.page.getByTestId('connect-button'),
      'Connect button should be present'
    ).toBeVisible({
      timeout: MAX_WAIT
    });
  }

  async expectConnectScreen() {
    await expect(this.page.getByText('Connect wallet')).toBeVisible({
      timeout: MAX_WAIT
    });
  }

  async expectNetworkScreen() {
    await expect(this.page.getByTestId('what-is-a-network-button')).toBeVisible();
  }

  async expectAddress(expectedAddress: string) {
    const address = this.page.getByTestId('w3m-address');

    await expect(address, 'Correct address should be present').toHaveText(expectedAddress);
  }

  async expectAcceptedSign() {
    await expect(this.page.getByText('Signature successful')).toBeVisible({
      timeout: 30 * 1000
    });
  }

  async expectRejectedSign() {
    await expect(this.page.getByText('Signature failed')).toBeVisible();
  }

  async expectSwitchedNetwork(network: string) {
    const switchNetworkButton = this.page.getByTestId(`account-select-network-text`);
    await expect(switchNetworkButton).toContainText(network);
  }

  async expectAllWalletsListSearchItem(id: string) {
    const allWalletsListSearchItem = this.page.getByTestId(`wallet-search-item-${id}`);
    await expect(allWalletsListSearchItem).toBeVisible();
  }

  async expectAllWallets() {
    const allWallets = this.page.getByTestId('all-wallets');
    await expect(allWallets).toBeVisible();
  }

  async expectWhatIsAWalletButton() {
    const whatIsAWalletButton = this.page.getByTestId('help-button');
    await expect(whatIsAWalletButton).toBeVisible();
  }

  async expectWhatIsAWalletView() {
    const whatIsAWalletView = this.page.getByTestId('what-is-a-wallet-view');
    await expect(whatIsAWalletView).toBeVisible();
  }

  async expectGetAWalletView() {
    const getAWalletView = this.page.getByTestId('get-a-wallet-view');
    await expect(getAWalletView).toBeVisible();
  }

  async expectNetworksDisabled(name: string) {
    const disabledNetworkButton = this.page.getByTestId(`w3m-network-switch-${name}`);
    disabledNetworkButton.click();
    await expect(this.page.getByText('Select network')).toBeVisible();
  }

  async expectToBeConnectedInstantly() {
    const accountButton = this.page.getByTestId('account-button');
    await expect(accountButton, 'Account button should be present').toBeAttached({
      timeout: 1000
    });
  }

  async expectModalNotVisible() {
    const modal = this.page.getByTestId('w3m-modal');
    await expect(modal).toBeHidden({
      timeout: 2000
    });
  }

  // async expectSnackbar(message: string) {
  //   await expect(this.page.getByTestId('wui-snackbar-message')).toHaveText(message, {
  //     timeout: MAX_WAIT
  //   });
  // }
}
