import { test, type BrowserContext } from '@playwright/test';
import { WalletPage } from './shared/pages/WalletPage';
import { WalletValidator } from './shared/validators/WalletValidator';
import { ModalPage } from './shared/pages/ModalPage';
import { ModalValidator } from './shared/validators/ModalValidator';
import { DEFAULT_CHAIN_NAME } from './shared/constants';

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
sampleWalletTest('it should be connected instantly after page refresh', async () => {
  await modalPage.page.reload();
  await modalValidator.expectToBeConnectedInstantly();
});

sampleWalletTest('it should show disabled networks', async () => {
  const disabledNetworks = 'Gnosis';
  await modalPage.openAccountModal();
  await modalPage.openNetworks();
  await modalValidator.expectNetworksDisabled(disabledNetworks);
  await modalPage.closeModal();
});

sampleWalletTest('it should switch networks and sign', async () => {
  const chains = ['Polygon', 'Ethereum'];

  async function processChain(index: number) {
    if (index >= chains.length) {
      return;
    }

    const chainName = chains[index] ?? DEFAULT_CHAIN_NAME;

    // -- Switch network --------------------------------------------------------
    const chainNameOnWalletPage = chainName;
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

  // Start processing from the first chain
  await processChain(0);
});

sampleWalletTest('it should show last connected network after refreshing', async () => {
  const chainName = 'Polygon';

  await modalPage.switchNetwork(chainName);
  await modalValidator.expectSwitchedNetwork(chainName);
  await modalPage.closeModal();

  await modalPage.page.reload();

  await modalPage.openAccountModal();
  await modalValidator.expectSwitchedNetwork(chainName);
  await modalPage.closeModal();
});

sampleWalletTest('it should reject sign', async () => {
  const chainName = 'Polygon';
  await modalPage.sign();
  await walletValidator.expectReceivedSign({ chainName });
  await walletPage.handleRequest({ accept: false });
  await modalValidator.expectRejectedSign();
});

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
  await walletValidator.expectSessionCard({ visible: false });
  await modalValidator.expectModalNotVisible();
  await walletPage.page.waitForTimeout(500);
});

sampleWalletTest('it should disconnect as expected', async () => {
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();
  await modalPage.disconnect();
  await modalValidator.expectDisconnected();
});
