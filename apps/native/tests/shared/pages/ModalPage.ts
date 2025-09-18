import { type Locator, type Page, expect } from '@playwright/test';
import { BASE_URL, DEFAULT_SESSION_PARAMS, TIMEOUTS } from '../constants';
import { WalletValidator } from '../validators/WalletValidator';
import { WalletPage } from './WalletPage';
import { SupportedChain, TimingRecords } from '../types';
import { ModalValidator } from '../validators/ModalValidator';

export class ModalPage {
  private readonly connectButton: Locator;
  private readonly url: string;

  constructor(public readonly page: Page) {
    this.connectButton = this.page.getByTestId('connect-button');
    this.url = BASE_URL;
  }

  async load() {
    await this.page.goto(this.url);
  }

  assertDefined<T>(value: T | undefined | null): T {
    expect(value).toBeDefined();

    return value!;
  }

  async getConnectUri(timingRecords?: TimingRecords): Promise<string> {
    await this.connectButton.click();
    await this.openAllWallets();
    await this.openQrCodeView();
    const qrLoadInitiatedTime = new Date();

    const qrCode = this.page.getByTestId('qr-code');
    await expect(qrCode).toBeVisible();
    const uri = await this.clickCopyLink();

    const qrLoadedTime = new Date();
    if (timingRecords) {
      timingRecords.push({
        item: 'qrLoad',
        timeMs: qrLoadedTime.getTime() - qrLoadInitiatedTime.getTime()
      });
    }

    return uri;
  }

  async getImmidiateConnectUri(timingRecords?: TimingRecords): Promise<string> {
    await this.connectButton.click();
    const qrLoadInitiatedTime = new Date();

    const qrCode = this.page.getByTestId('qr-code');
    await expect(qrCode).toBeVisible();
    const uri = await this.clickCopyLink();
    const qrLoadedTime = new Date();
    if (timingRecords) {
      timingRecords.push({
        item: 'qrLoad',
        timeMs: qrLoadedTime.getTime() - qrLoadInitiatedTime.getTime()
      });
    }

    return uri;
  }

  async qrCodeFlow(page: ModalPage, walletPage: WalletPage, immediate?: boolean): Promise<void> {
    let uri: string;
    await walletPage.load();
    if (immediate) {
      uri = await page.getImmidiateConnectUri();
    } else {
      uri = await page.getConnectUri();
    }
    await walletPage.connectWithUri(uri);

    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS);
    const walletValidator = new WalletValidator(walletPage.page);
    await walletValidator.expectConnected();
  }

  async searchWalletFlow(page: ModalPage, walletName: string, walletId: string) {
    await this.openAllWallets();
    await this.search(walletName);
    await this.page.waitForTimeout(1000);
    const modalValidator = new ModalValidator(page.page);
    await modalValidator.expectAllWalletsListSearchItem(walletId);
  }

  async disconnect() {
    const accountBtn = this.page.getByTestId('account-button');
    await expect(accountBtn, 'Account button should be visible').toBeVisible();
    await expect(accountBtn, 'Account button should be enabled').toBeEnabled();
    await accountBtn.click();
    const disconnectBtn = this.page.getByTestId('button-disconnect');
    await expect(disconnectBtn, 'Disconnect button should be visible').toBeVisible();
    await expect(disconnectBtn, 'Disconnect button should be enabled').toBeEnabled();
    await disconnectBtn.click();
  }

  async sign() {
    const signButton = this.page.getByTestId('sign-message-button');
    await signButton.scrollIntoViewIfNeeded();
    await signButton.click();
  }

  async clickWhatIsAWalletButton() {
    await this.page.getByTestId('help-button').click();
  }

  async clickGetAWalletButton() {
    await this.page.getByTestId('get-a-wallet-button').click();
  }

  async switchNetwork(network: SupportedChain) {
    await this.page.getByTestId(`w3m-network-switch-${network}`).click();
    // The state is changing too fast and test runner doesn't wait for the loading page
    await this.page.waitForTimeout(TIMEOUTS.NETWORK_SWITCH);
  }

  async openAccountModal() {
    await this.page.getByTestId('account-button').click();
  }

  async openConnectModal() {
    await this.page.getByTestId('connect-button').click();
  }

  async openNetworkModal() {
    await this.page.getByTestId('network-button').click();
  }

  async closeModal() {
    await this.page.getByTestId('header-close')?.click?.();
    // Wait for the modal fade out animation
    await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  async openAllWallets() {
    const allWallets = this.page.getByTestId('all-wallets');
    await expect(allWallets, 'All wallets should be visible').toBeVisible();
    await allWallets.click();
  }

  async openQrCodeView() {
    const qrCodeButton = this.page.getByTestId('button-qr-code');
    await expect(qrCodeButton, 'QR code view should be visible').toBeVisible();
    await qrCodeButton.click();
  }

  async clickHookDisconnectButton() {
    const disconnectHookButton = this.page.getByTestId('disconnect-hook-button');
    await expect(disconnectHookButton).toBeVisible();
    await disconnectHookButton.click();
  }

  async clickCopyLink() {
    const copyLink = this.page.getByTestId('copy-link');
    await expect(copyLink).toBeVisible();

    let hasCopied = false;

    while (!hasCopied) {
      await copyLink.click();
      await this.page.waitForTimeout(500);

      const snackbarMessage = this.page.getByTestId('wui-snackbar-message');
      const snackbarMessageText = await snackbarMessage.textContent();

      if (snackbarMessageText && snackbarMessageText.startsWith('Link copied')) {
        hasCopied = true;
      }
    }

    return this.page.evaluate(() => navigator.clipboard.readText());
  }

  async search(value: string) {
    const searchInput = this.page.getByTestId('wui-input-text');
    await expect(searchInput, 'Search input should be visible').toBeVisible();
    await searchInput.click();
    await searchInput.fill(value);
  }

  async goToNetworks() {
    await this.page.getByTestId('button-network').click();
    await expect(this.page.getByText('Select network')).toBeVisible();
  }

  async goToActivity() {
    await this.page.getByTestId('button-activity').click();
  }

  async goBack() {
    await this.page.getByTestId('button-back').click();
  }

  async expectLoaderVisible() {
    await expect(
      this.page.getByTestId('loading-spinner'),
      'Loading spinner should be visible'
    ).toBeVisible();
  }

  async expectLoaderHidden() {
    await expect(
      this.page.getByTestId('loading-spinner'),
      'Loading spinner should be hidden'
    ).toBeHidden();
  }
}
