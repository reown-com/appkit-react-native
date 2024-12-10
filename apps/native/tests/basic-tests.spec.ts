import { test, BrowserContext, Page } from '@playwright/test';
import { ModalPage } from './shared/pages/ModalPage';
import { ModalValidator } from './shared/validators/ModalValidator';

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
