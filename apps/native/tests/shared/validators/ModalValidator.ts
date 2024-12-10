import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { getMaximumWaitConnections } from '../utils/timeouts';
// import { CaipNetworkId } from '../types';

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

  async expectOnSignInEventCalled(toBe: boolean) {
    await expect(this.page.getByTestId('siwe-event-onSignIn')).toContainText(`${toBe}`);
  }

  async expectUnauthenticated() {
    await expect(
      this.page.getByTestId('w3m-authentication-status'),
      'Authentication status should be: unauthenticated'
    ).toContainText('unauthenticated');
  }

  async expectOnSignOutEventCalled(toBe: boolean) {
    await expect(this.page.getByTestId('siwe-event-onSignOut')).toContainText(`${toBe}`);
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

  // async expectSingleAccount() {
  //   await expect(
  //     this.page.getByTestId('single-account-avatar'),
  //     'Single account widget should be present'
  //   ).toBeVisible({
  //     timeout: MAX_WAIT
  //   });
  // }

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

  // async expectCaipAddressHaveCorrectNetworkId(caipNetworkId: CaipNetworkId) {
  //   const address = this.page.getByTestId('w3m-caip-address');
  //   await expect(address, 'Correct CAIP address should be present').toContainText(
  //     caipNetworkId.toString()
  //   );
  // }

  // async expectNetwork(network: string) {
  //   const networkButton = this.page.getByTestId('w3m-account-select-network');
  //   await expect(networkButton, `Network button should contain text ${network}`).toHaveText(
  //     network,
  //     {
  //       timeout: 5000
  //     }
  //   );
  // }

  async expectAcceptedSign() {
    await expect(this.page.getByText('Signature successful')).toBeVisible({
      timeout: 30 * 1000
    });
  }

  async expectRejectedSign() {
    await expect(this.page.getByText('Signature failed')).toBeVisible();
  }

  async expectSwitchedNetwork(network: string) {
    const switchNetworkButton = this.page.getByTestId(`w3m-network-switch-${network}`);
    await expect(switchNetworkButton).toBeVisible();
  }

  // async expectSwitchChainView(chainName: string) {
  //   const title = this.page.getByTestId(`w3m-switch-active-chain-to-${chainName}`);
  //   await expect(title).toBeVisible();
  // }

  // async expectSwitchedNetworkWithNetworkView() {
  //   const switchNetworkViewLocator = this.page.locator('w3m-network-switch-view');
  //   await expect(switchNetworkViewLocator).toBeVisible();
  //   await expect(switchNetworkViewLocator).not.toBeVisible({
  //     timeout: 20_000
  //   });
  // }

  // async expectSwitchedNetworkOnNetworksView(name: string) {
  //   const networkOptions = this.page.getByTestId(`w3m-network-switch-${name}`);
  //   await expect(networkOptions.locator('wui-icon')).toBeVisible();
  // }

  // expectSecureSiteFrameNotInjected() {
  //   const secureSiteIframe = this.page.frame({ name: 'w3m-secure-iframe' });
  //   expect(secureSiteIframe).toBeNull();
  // }

  // expectQueryParameterFromUrl({ url, key, value }: { url: string; key: string; value: string }) {
  //   const _url = new URL(url);
  //   const queryParameters = Object.fromEntries(_url.searchParams.entries());
  //   expect(queryParameters[key]).toBe(value);
  // }

  // async expectAllWalletsListSearchItem(id: string) {
  //   const allWalletsListSearchItem = this.page.getByTestId(`wallet-search-item-${id}`);
  //   await expect(allWalletsListSearchItem).toBeVisible();
  // }

  // async expectNoSocials() {
  //   const socialList = this.page.getByTestId('wui-list-social');
  //   await expect(socialList).toBeHidden();
  // }

  async expectAllWallets() {
    const allWallets = this.page.getByTestId('all-wallets');
    await expect(allWallets).toBeVisible();
  }

  // async expectNoTryAgainButton() {
  //   const secondaryButton = this.page.getByTestId('w3m-connecting-widget-secondary-button');
  //   await expect(secondaryButton).toBeHidden();
  // }

  // async expectTryAgainButton() {
  //   const secondaryButton = this.page.getByTestId('w3m-connecting-widget-secondary-button');
  //   await expect(secondaryButton).toBeVisible();
  // }

  // async expectAlertBarText(text: string) {
  //   const alertBarText = this.page.getByTestId('wui-alertbar-text');
  //   await expect(alertBarText).toHaveText(text);
  // }

  // async expectEmailLogin() {
  //   const emailInput = this.page.getByTestId('wui-email-input');
  //   await expect(emailInput).toBeVisible();
  // }

  // async expectEmailLineSeparator() {
  //   const emailInput = this.page.getByTestId('w3m-email-login-or-separator');
  //   await expect(emailInput).toBeVisible();
  // }

  // async expectValidSignature(signature: `0x${string}`, address: `0x${string}`, chainId: number) {
  //   const isVerified = await verifySignature({
  //     address,
  //     message: 'Hello AppKit!',
  //     signature,
  //     chainId
  //   });

  //   expect(isVerified).toBe(true);
  // }

  // async expectNetworkNotSupportedVisible() {
  //   const networkNotSupportedMessage = this.page.getByText(
  //     'This app doesn’t support your current network. Switch to an available option to continue.'
  //   );
  //   await expect(
  //     networkNotSupportedMessage,
  //     'Network not supported message should be visible'
  //   ).toBeVisible();
  // }

  // async expectAccountPageVisible() {
  //   const switchNetworkButton = this.page.getByTestId('w3m-account-select-network');
  //   await expect(switchNetworkButton).toBeVisible();
  // }

  // async expectWalletGuide(_library: string, guide: 'get-started' | 'explore') {
  //   const walletGuide = this.page.getByTestId(
  //     guide === 'explore' ? 'w3m-wallet-guide-explore' : 'w3m-wallet-guide-get-started'
  //   );
  //   await expect(walletGuide).toBeVisible();
  // }

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

  // async expectAccountNameFound(name: string) {
  //   const suggestion = this.page.getByTestId('account-name-suggestion').getByText(name);
  //   await expect(suggestion).toBeVisible();
  // }

  // async expectHeaderText(text: string) {
  //   const headerText = this.page.getByTestId('header-text');
  //   await expect(headerText).toHaveText(text);
  // }

  // async expectSignatureRequestFrameByText(headerText: string) {
  //   await expect(
  //     this.page.frameLocator('#w3m-iframe').getByText(headerText),
  //     'AppKit iframe should be visible'
  //   ).toBeVisible({
  //     timeout: 10000
  //   });
  //   await this.page.waitForTimeout(500);
  // }

  // async expectAccountNameApproveTransaction(name: string) {
  //   await this.expectSignatureRequestFrameByText('requests a signature');
  //   const iframe = this.page.frameLocator('#w3m-iframe');
  //   const textContent = await iframe.locator('.textContent').textContent();
  //   expect(textContent).toContain(`{"name":"${name}","attributes":{},"timestamp":`);
  // }

  // async expectCallStatusSuccessOrRetry(sendCallsId: string, allowedRetry: boolean) {
  //   const callStatusReceipt = this.page.getByText('"status": "CONFIRMED"');
  //   const isConfirmed = await callStatusReceipt.isVisible({
  //     timeout: 10 * 1000
  //   });
  //   if (isConfirmed) {
  //     const closeButton = this.page.locator('#toast-close-button');

  //     await expect(closeButton).toBeVisible();
  //     await closeButton.click();
  //   } else if (allowedRetry) {
  //     const callStatusButton = this.page.getByTestId('get-calls-status-button');
  //     await expect(callStatusButton).toBeVisible();
  //     await callStatusButton.click();
  //     this.expectCallStatusSuccessOrRetry(sendCallsId, false);
  //   }

  //   throw new Error('Call status not confirmed');
  // }

  // async expectNetworkVisible(name: string) {
  //   const network = this.page.getByTestId(`w3m-network-switch-${name}`);
  //   await expect(network).toBeVisible();
  //   await expect(network).toBeDisabled();
  // }

  async expectNetworksDisabled(name: string) {
    const disabledNetworkButton = this.page.getByTestId(`w3m-network-switch-${name}`);
    disabledNetworkButton.click();
    await expect(this.page.getByText('Select network')).toBeVisible();
    // await expect(disabledNetworkButton).toBeDisabled();
  }

  async expectToBeConnectedInstantly() {
    const accountButton = this.page.getByTestId('account-button');
    await expect(accountButton, 'Account button should be present').toBeAttached({
      timeout: 1000
    });
  }

  // async expectConnectButtonLoading() {
  //   const connectButton = this.page.getByTestId('connect-button');
  //   await expect(connectButton).toContainText('Connecting...');
  // }

  // async expectAccountButtonReady() {
  //   const accountButton = this.page.getByTestId('account-button');
  //   await expect(accountButton).toBeVisible({ timeout: MAX_WAIT });
  // }

  // async expectAccountSwitched(oldAddress: string) {
  //   const address = this.page.getByTestId('w3m-address');
  //   await expect(address).not.toHaveText(oldAddress);
  // }

  async expectModalNotVisible() {
    const modal = this.page.getByTestId('w3m-modal');
    await expect(modal).toBeHidden({
      timeout: 2000
    });
  }

  async expectSnackbar(message: string) {
    await expect(this.page.getByTestId('wui-snackbar-message')).toHaveText(message, {
      timeout: MAX_WAIT
    });
  }
}