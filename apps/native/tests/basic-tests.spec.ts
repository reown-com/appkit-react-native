import { test, BrowserContext, Page } from '@playwright/test';
import { ModalPage } from './shared/pages/ModalPage';
import { ModalValidator } from './shared/validators/ModalValidator';

const METAMASK_WALLET_ID = 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96';

let context: BrowserContext;
let browserPage: Page;
let modalPage: ModalPage;
let modalValidator: ModalValidator;

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  browserPage = await context.newPage();

  modalPage = new ModalPage(browserPage);
  modalValidator = new ModalValidator(modalPage.page);

  await modalPage.load();
});

test('Should be able to open modal', async () => {
  await modalPage.openConnectModal();
  await modalValidator.expectConnectScreen();
  await modalPage.closeModal();
});

test('Should be able to open network view', async () => {
  await modalPage.openNetworkModal();
  await modalValidator.expectNetworkScreen();
  await modalPage.closeModal();
});

test('Should be able to open modal with the open hook', async () => {
  const openHookButton = modalPage.page.getByTestId('open-hook-button');
  await openHookButton.click();
  await modalValidator.expectConnectScreen();
  await modalPage.closeModal();
});

test('it should display what is a wallet view', async () => {
  await modalPage.openConnectModal();
  await modalValidator.expectWhatIsAWalletButton();
  await modalPage.clickWhatIsAWalletButton();
  await modalValidator.expectWhatIsAWalletView();
  await modalPage.clickGetAWalletButton();
  await modalValidator.expectGetAWalletView();
  await modalPage.closeModal();
});

test('it should search for a wallet', async () => {
  await modalPage.openConnectModal();
  await modalValidator.expectConnectScreen();
  await modalPage.searchWalletFlow(modalPage, 'MetaMask', METAMASK_WALLET_ID);
  await modalPage.closeModal();
});
