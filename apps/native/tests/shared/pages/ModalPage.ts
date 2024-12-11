import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BASE_URL, DEFAULT_SESSION_PARAMS } from '../constants';
import { WalletValidator } from '../validators/WalletValidator';
import { WalletPage } from './WalletPage';
import { TimingRecords } from '../types';
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
    const disconnectBtn = this.page.getByTestId('disconnect-button');
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

  // async promptSiwe() {
  //   const siweSign = this.page.getByTestId('w3m-connecting-siwe-sign');
  //   await expect(siweSign, 'Siwe prompt sign button should be visible').toBeVisible({
  //     timeout: 10_000
  //   });
  //   await expect(siweSign, 'Siwe prompt sign button should be enabled').toBeEnabled();
  //   await siweSign.click();
  // }

  // async cancelSiwe() {
  //   await this.page.getByTestId('w3m-connecting-siwe-cancel').click();
  // }

  async switchNetwork(network: string) {
    await this.openAccountModal();
    await this.page.getByTestId('w3m-account-select-network').click();
    await this.page.getByTestId(`w3m-network-switch-${network}`).click();
    // The state is chaing too fast and test runner doesn't wait the loading page. It's fastly checking the network selection button and detect that it's switched already.
    await this.page.waitForTimeout(300);
  }

  // async clickWalletDeeplink() {
  //   await this.connectButton.click();
  //   await this.page.getByTestId('wallet-selector-react-wallet-v2').click();
  //   await this.page.getByTestId('tab-desktop').click();
  // }

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
    await this.page.waitForTimeout(300);
  }

  // async switchNetworkWithNetworkButton(networkName: string) {
  //   const networkButton = this.page.getByTestId('wui-network-button');
  //   await networkButton.click();

  //   const networkToSwitchButton = this.page.getByTestId(`w3m-network-switch-${networkName}`);
  //   await networkToSwitchButton.click();
  // }

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

  // async clickAllWalletsListSearchItem(id: string) {
  //   const allWalletsListSearchItem = this.page.getByTestId(`wallet-search-item-${id}`);
  //   await expect(allWalletsListSearchItem).toBeVisible();
  //   await allWalletsListSearchItem.click();
  // }

  // async clickTabWebApp() {
  //   const tabWebApp = this.page.getByTestId('tab-webapp');
  //   await expect(tabWebApp).toBeVisible();
  //   await tabWebApp.click();
  // }

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

  // async clickOpenWebApp() {
  //   let url = '';

  //   const openButton = this.page.getByTestId('w3m-connecting-widget-secondary-button');
  //   await expect(openButton).toBeVisible();
  //   await expect(openButton).toHaveText('Open');

  //   while (!url) {
  //     await openButton.click();
  //     await this.page.waitForTimeout(500);

  //     const pages = this.page.context().pages();

  //     // Check if more than 1 tab is open
  //     if (pages.length > 1) {
  //       const lastTab = pages[pages.length - 1];

  //       if (lastTab) {
  //         url = lastTab.url();
  //         break;
  //       }
  //     }
  //   }

  //   return url;
  // }

  async search(value: string) {
    const searchInput = this.page.getByTestId('wui-input-text');
    await expect(searchInput, 'Search input should be visible').toBeVisible();
    await searchInput.click();
    await searchInput.fill(value);
  }

  async openNetworks() {
    await this.page.getByTestId('w3m-account-select-network').click();
    await expect(this.page.getByText('Select network')).toBeVisible();
  }

  // async openProfileView() {
  //   await this.page.getByTestId('wui-profile-button').click();
  // }

  // async getAddress(): Promise<`0x${string}`> {
  //   const address = await this.page.getByTestId('w3m-address').textContent();
  //   expect(address, 'Address should be present').toBeTruthy();

  //   return address as `0x${string}`;
  // }

  // async getChainId(): Promise<number> {
  //   const chainId = await this.page.getByTestId('w3m-chain-id').textContent();
  //   expect(chainId, 'Chain ID should be present').toBeTruthy();

  //   return Number(chainId);
  // }

  // async switchNetworkWithHook() {
  //   await this.page.getByTestId('switch-network-hook-button').click();
  // }
}
