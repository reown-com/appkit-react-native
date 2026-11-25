import { test, type BrowserContext } from '@playwright/test';
import { ModalPage } from './shared/pages/ModalPage';
import { OnRampPage } from './shared/pages/OnRampPage';
import { OnRampValidator } from './shared/validators/OnRampValidator';
import { WalletPage } from './shared/pages/WalletPage';
import { ModalValidator } from './shared/validators/ModalValidator';

let modalPage: ModalPage;
let modalValidator: ModalValidator;
let onRampPage: OnRampPage;
let onRampValidator: OnRampValidator;
let walletPage: WalletPage;
let context: BrowserContext;

// -- Setup --------------------------------------------------------------------
const onrampTest = test.extend<{ library: string }>({
  library: ['wagmi', { option: true }]
});

onrampTest.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  const browserPage = await context.newPage();

  modalPage = new ModalPage(browserPage);
  modalValidator = new ModalValidator(browserPage);
  onRampPage = new OnRampPage(browserPage);
  onRampValidator = new OnRampValidator(browserPage);
  walletPage = new WalletPage(await context.newPage());

  await modalPage.load();

  // Connect to wallet first
  await modalPage.qrCodeFlow(modalPage, walletPage);
  await modalValidator.expectConnected();
});

onrampTest.beforeEach(async () => {
  await onRampPage.openBuyCryptoModal();
  await onRampValidator.expectOnRampInitialScreen();

  const currency = await onRampPage.getPaymentCurrency();
  if (currency !== 'USD') {
    await onRampPage.openSettings();
    await onRampValidator.expectSettingsScreen();
    await onRampPage.clickSelectCountry();
    await onRampPage.searchCountry('United States');
    await onRampPage.selectCountry('US');
    await modalPage.goBack();
    await onRampValidator.expectOnRampInitialScreen();
    await onRampValidator.expectPaymentCurrency('USD');
  }
});

onrampTest.afterEach(async () => {
  await modalPage.goBack();
  await modalPage.closeModal();
});

onrampTest.afterAll(async () => {
  await modalPage.page.close();
  await walletPage.page.close();
});

// -- Tests --------------------------------------------------------------------
/**
 * OnRamp Tests
 * Tests the OnRamp functionality including:
 * - Opening the OnRamp modal
 * - Loading states
 * - Currency selection
 * - Amount input and quotes
 * - Payment method selection
 * - Checkout flow
 */

onrampTest('Should be able to select a purchase currency', async () => {
  await onRampPage.clickSelectCurrency();
  await onRampValidator.expectCurrencySelectionModal();
  await onRampPage.selectCurrency('ZRX');
  await onRampValidator.expectSelectedCurrency('ZRX');
});

onrampTest('Should be able to select a payment method', async () => {
  await onRampPage.enterAmount(200);
  await onRampValidator.expectQuotesLoaded();
  await onRampPage.clickPaymentMethod();
  await onRampValidator.expectPaymentMethodModal();
  await onRampPage.selectPaymentMethod('Apple Pay');
  await onRampPage.selectQuote(0);
  await onRampValidator.expectOnRampInitialScreen();
});

onrampTest('Should be able to navigate to onramp settings', async () => {
  await onRampPage.openSettings();
  await onRampValidator.expectSettingsScreen();
  await modalPage.goBack();
  await onRampValidator.expectOnRampInitialScreen();
});

onrampTest('Should be able to select a country and see currency update', async () => {
  // Navigate to settings and select a country
  await onRampPage.openSettings();
  await onRampValidator.expectSettingsScreen();
  await onRampPage.clickSelectCountry();
  await onRampPage.searchCountry('Argentina');
  await onRampPage.selectCountry('AR');

  // Go back to the main OnRamp screen
  await modalPage.goBack();
  await onRampValidator.expectOnRampInitialScreen();

  // Verify that the currency has updated to ARS
  await onRampValidator.expectPaymentCurrency('ARS');
});

onrampTest('Should display appropriate error messages for invalid amounts', async () => {
  // Too low
  await onRampPage.enterAmount(1);
  await onRampValidator.expectAmountError();

  // Too high
  await onRampPage.enterAmount(50000);
  await onRampValidator.expectAmountError();
});

onrampTest('Should go through checkout to the loading view', async () => {
  test.setTimeout(60000);

  await onRampPage.enterAmount(100);
  await onRampValidator.expectQuotesLoaded();
  await onRampPage.clickContinue();
  await onRampValidator.expectCheckoutScreen();
  await onRampPage.clickConfirmCheckout();
  await onRampValidator.expectLoadingWidgetView();
});
