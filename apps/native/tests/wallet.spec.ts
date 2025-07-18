import { test, type BrowserContext } from '@playwright/test';
import { WalletPage } from './shared/pages/WalletPage';
import { WalletValidator } from './shared/validators/WalletValidator';
import { ModalPage } from './shared/pages/ModalPage';
import { ModalValidator } from './shared/validators/ModalValidator';
import { DEFAULT_CHAIN_NAME, TEST_CHAINS } from './shared/constants';

let modalPage: ModalPage;
let modalValidator: ModalValidator;
let walletPage: WalletPage;
let walletValidator: WalletValidator;
let context: BrowserContext;

// -- Setup --------------------------------------------------------------------
const sampleWalletTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
});

sampleWalletTest.describe.configure({ mode: 'serial' });

sampleWalletTest.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  const browserPage = await context.newPage();

  modalPage = new ModalPage(browserPage);
  walletPage = new WalletPage(await context.newPage());
  modalValidator = new ModalValidator(browserPage);
  walletValidator = new WalletValidator(walletPage.page);

  await modalPage.load();
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();
});

sampleWalletTest.afterAll(async () => {
  await modalPage.page.close();
});

// -- Tests --------------------------------------------------------------------
/**
 * Connection Tests
 * Tests the basic connection functionality including:
 * - Page refresh behavior
 * - Network switching
 * - Disconnection flows
 */

sampleWalletTest('it should be connected instantly after page refresh', async () => {
  await modalPage.page.reload();
  await modalValidator.expectToBeConnectedInstantly();
});

/**
 * Network Tests
 * Tests network-related functionality including:
 * - Disabled networks visibility
 * - Network switching
 * - Network persistence after refresh
 */

sampleWalletTest('it should show disabled networks', async () => {
  await modalPage.openAccountModal();
  await modalPage.goToNetworks();
  await modalValidator.expectNetworksDisabled(TEST_CHAINS.GNOSIS);
  await modalPage.closeModal();
});

sampleWalletTest('it should switch networks and sign', async () => {
  const chains = [TEST_CHAINS.POLYGON, TEST_CHAINS.ETHEREUM];

  async function processChain(index: number) {
    if (index >= chains.length) {
      return;
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME;

    // -- Switch network --------------------------------------------------------
    const chainNameOnWalletPage = chainName;
    await modalPage.openAccountModal();
    await modalPage.goToNetworks();
    await modalPage.switchNetwork(chainName);
    await modalValidator.expectSwitchedNetwork(chainName);
    await modalPage.closeModal();

    // -- Sign ------------------------------------------------------------------
    await modalPage.sign();
    await walletValidator.expectReceivedSign({ chainName: chainNameOnWalletPage });
    await walletPage.handleRequest({ accept: true });
    await modalValidator.expectAcceptedSign();

    await processChain(index + 1);
  }

  await processChain(0);
});

sampleWalletTest('it should show last connected network after refreshing', async () => {
  await modalPage.openAccountModal();
  await modalPage.goToNetworks();
  await modalPage.switchNetwork(TEST_CHAINS.POLYGON);
  await modalValidator.expectSwitchedNetwork(TEST_CHAINS.POLYGON);
  await modalPage.closeModal();

  await modalPage.page.reload();

  await modalPage.openAccountModal();
  await modalValidator.expectSwitchedNetwork(TEST_CHAINS.POLYGON);
  await modalPage.closeModal();
});

/**
 * Signing Tests
 * Tests message signing functionality including:
 * - Successful signing flow
 * - Rejection flow
 */

sampleWalletTest('it should reject sign', async () => {
  await modalPage.sign();
  await walletValidator.expectReceivedSign({ chainName: TEST_CHAINS.POLYGON });
  await walletPage.handleRequest({ accept: false });
  await modalValidator.expectRejectedSign();
});

/**
 * Activity Screen Tests
 * Tests the Activity screen behavior including:
 * - Loader visibility on first visit
 * - Loader behavior on subsequent visits
 * - Loader behavior after network changes
 */

sampleWalletTest('shows loader behavior on first visit to Activity screen', async () => {
  // First visit to Activity screen
  await modalPage.openAccountModal();
  await modalPage.goToActivity();
  await modalPage.expectLoaderVisible();
  await modalPage.expectLoaderHidden();

  // Second visit to Activity screen
  await modalPage.goBack();
  await modalPage.goToActivity();
  await modalPage.expectLoaderHidden();

  // Third visit after closing the modal
  await modalPage.closeModal();
  await modalPage.openAccountModal();
  await modalPage.goToActivity();
  await modalPage.expectLoaderHidden();
  await modalPage.closeModal();
});

sampleWalletTest('shows loader behavior after network change in Activity screen', async () => {
  await modalPage.openAccountModal();

  // Change network
  await modalPage.goToNetworks();
  await modalPage.switchNetwork(TEST_CHAINS.ETHEREUM);
  await modalValidator.expectSwitchedNetwork(TEST_CHAINS.ETHEREUM);

  // Visit Activity screen after network change
  await modalPage.goToActivity();
  await modalPage.expectLoaderVisible();
  await modalPage.expectLoaderHidden();

  // Second visit after network change
  await modalPage.goBack();
  await modalPage.goToActivity();
  await modalPage.expectLoaderHidden();
  await modalPage.closeModal();
});

/**
 * Disconnection Tests
 * Tests various disconnection scenarios including:
 * - Hook-based disconnection
 * - Wallet-initiated disconnection
 * - Manual disconnection
 */

sampleWalletTest('it should disconnect using hook', async () => {
  await modalValidator.expectConnected();
  await modalPage.clickHookDisconnectButton();
  await modalValidator.expectDisconnected();
});

sampleWalletTest('it should disconnect and close modal when connecting from wallet', async () => {
  await modalValidator.expectDisconnected();
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();
  await modalPage.openAccountModal();
  await walletPage.disconnectConnection();
  await modalValidator.expectModalNotVisible();
  await walletPage.page.waitForTimeout(500);
});

sampleWalletTest('it should disconnect as expected', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();
  await modalPage.disconnect();
  await modalValidator.expectDisconnected();
});
