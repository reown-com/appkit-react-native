import { test, type BrowserContext } from '@playwright/test';
import { WalletPage } from './shared/pages/WalletPage';
import { WalletValidator } from './shared/validators/WalletValidator';
import { ModalPage } from './shared/pages/ModalPage';
import { ModalValidator } from './shared/validators/ModalValidator';
import { DEFAULT_CHAIN_NAME, TEST_CHAINS, UNSUPPORTED_CHAIN_ID } from './shared/constants';

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

sampleWalletTest('it should switch networks and sign', async () => {
  const chains = [TEST_CHAINS.POLYGON, TEST_CHAINS.ETHEREUM];

  async function processChain(index: number) {
    const chainName = chains[index];
    if (!chainName) {
      return;
    }

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

sampleWalletTest(
  'it should disconnect and close modal when disconnecting from wallet',
  async () => {
    await modalValidator.expectDisconnected();
    await modalPage.qrCodeFlow(modalPage, walletPage);
    await modalValidator.expectConnected();
    await modalPage.openAccountModal();
    await walletPage.disconnectConnection();
    await modalValidator.expectModalNotVisible();
    await walletPage.page.waitForTimeout(500);
  }
);

sampleWalletTest('it should disconnect as expected', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();
  await modalPage.disconnect();
  await modalValidator.expectDisconnected();
});

/**
 * Unsupported network Tests
 * The wallet moves to a network the app does not support. The app must show the unsupported
 * network view and stay usable through both ways out of it: switching to a supported network
 * and disconnecting.
 *
 * The view only lists networks already approved in the session, so the switch is handled by the
 * provider without a wallet request (the hosted test wallet never gets one to reject).
 */

sampleWalletTest('it should recover from an unsupported network in the wallet', async () => {
  await modalValidator.expectDisconnected();
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();

  // The wallet moves to a network the app does not list (Sepolia)
  await walletPage.enableTestnets();
  await walletPage.switchNetwork(UNSUPPORTED_CHAIN_ID);
  await modalValidator.expectUnsupportedChainView();

  // Pick a supported network: the view closes and the app can sign again
  await modalPage.switchNetworkFromUnsupportedView(TEST_CHAINS.ETHEREUM);
  await modalValidator.expectModalNotVisible();
  await modalValidator.expectConnected();
  await modalPage.sign();
  await walletValidator.expectReceivedSign({ chainName: TEST_CHAINS.ETHEREUM });
  await walletPage.handleRequest({ accept: true });
  await modalValidator.expectAcceptedSign();

  // Back on an unsupported network, the user can disconnect from the view
  await walletPage.switchNetwork(UNSUPPORTED_CHAIN_ID);
  await modalValidator.expectUnsupportedChainView();
  await modalPage.disconnectFromUnsupportedView();
  await modalValidator.expectDisconnected();
});

/**
 * Reconnection Tests
 * A disconnect followed by a new connection must not leave duplicated adapter listeners or a stale
 * session behind: the sign request must reach the wallet once, on the new session.
 */

sampleWalletTest('it should connect, disconnect, reconnect and sign once', async () => {
  await modalValidator.expectDisconnected();

  // Connect
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();

  // Disconnect
  await modalPage.disconnect();
  await modalValidator.expectDisconnected();
  await walletValidator.expectDisconnected();

  // Reconnect
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();
  await walletValidator.expectSessionCount(1);

  // Sign
  await modalPage.sign();
  await walletValidator.expectReceivedSign({ chainName: DEFAULT_CHAIN_NAME });
  await walletPage.handleRequest({ accept: true });
  await modalValidator.expectAcceptedSign();
  await walletValidator.expectNoPendingRequest();

  // The modal shows the connected account
  await modalPage.openAccountModal();
  await modalValidator.expectSwitchedNetwork(DEFAULT_CHAIN_NAME);
  await modalPage.closeModal();
  await modalValidator.expectModalNotVisible();
  await modalValidator.expectConnected();

  // Leave the suite disconnected
  await modalPage.disconnect();
  await modalValidator.expectDisconnected();
});
