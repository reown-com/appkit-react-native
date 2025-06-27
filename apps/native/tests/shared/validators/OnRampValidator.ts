import { Page, expect } from '@playwright/test';

export class OnRampValidator {
  constructor(private readonly page: Page) {}

  async expectOnRampInitialScreen() {
    // Verify that the main OnRamp screen elements are visible
    await expect(this.page.getByText('You Buy')).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByTestId('currency-input')).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText('Continue')).toBeVisible({ timeout: 5000 });
  }

  async expectOnRampLoadingView() {
    // Verify that the loading view is displayed
    await expect(this.page.getByTestId('onramp-loading-view')).toBeVisible({ timeout: 10000 });
  }

  async expectCurrencySelectionModal() {
    // Verify that the currency selection modal is displayed
    await expect(this.page.getByText('Select token')).toBeVisible({ timeout: 10000 });
    // Check if at least one currency item is visible
    await expect(this.page.getByTestId(new RegExp('currency-item-.')).first()).toBeVisible({
      timeout: 5000
    });
  }

  async expectSelectedCurrency(currency: string) {
    // Verify that the selected currency is displayed in the UI
    const currencySelector = this.page.getByTestId('currency-selector');
    await expect(currencySelector).toHaveText(currency, { timeout: 5000 });
  }

  async expectQuotesLoaded() {
    // Verify that quotes have been loaded by checking for the 'via' text with provider
    await expect(this.page.getByText('via')).toBeVisible({ timeout: 10000 });
    // Also verify that the continue button is enabled
    const continueButton = this.page.getByText('Continue');
    await expect(continueButton).toBeEnabled({ timeout: 10000 });
  }

  async expectPaymentMethodModal() {
    // Verify that the payment method modal is displayed
    await expect(this.page.getByText('Pay with')).toBeVisible({ timeout: 10000 });
    // Check that at least one payment method is visible
    await expect(this.page.getByTestId(new RegExp('payment-method-item-.')).first()).toBeVisible({
      timeout: 5000
    });
  }

  async expectSelectedPaymentMethod(name: string) {
    // Verify that a payment method has been selected
    const paymentMethod = this.page.getByText(name);
    await expect(paymentMethod).toBeVisible({ timeout: 5000 });
  }

  async expectCheckoutScreen() {
    // Verify that the checkout screen is displayed
    await expect(this.page.getByText('Checkout')).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByTestId('button-confirm')).toBeVisible({ timeout: 10000 });
  }

  async expectTransactionScreen() {
    // Verify that the transaction screen is displayed
    await expect(this.page.getByText('Transaction')).toBeVisible({ timeout: 10000 });
    // Additional checks for transaction details could be added here
  }

  async expectAmountError() {
    // Verify that an amount error message is displayed
    try {
      await expect(this.page.getByTestId('currency-input-error')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      // Look for error text directly if no test ID is present
      await expect(this.page.getByText(/Amount/i)).toBeVisible({ timeout: 5000 });
    }
  }

  async expectSettingsScreen() {
    // Verify that the settings screen is displayed
    await expect(this.page.getByText('Preferences')).toBeVisible({ timeout: 10000 });

    // Check for country or currency options
    try {
      await expect(this.page.getByText('Select Country')).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Try alternative text
      await expect(this.page.getByText('Select Currency')).toBeVisible({ timeout: 5000 });
    }
  }

  async expectPaymentCurrency(currency: string) {
    const currencyInput = this.page.getByTestId('currency-input-symbol');
    await expect(currencyInput).toHaveText(currency, { timeout: 5000 });
  }

  async expectLoadingWidgetView() {
    // Verify that the loading widget view is displayed
    await expect(this.page.getByTestId('onramp-loading-widget-view')).toBeVisible({
      timeout: 10000
    });
    await expect(this.page.getByText('Connecting with')).toBeVisible();
    await expect(
      this.page.getByText('Please wait while we redirect you to finalize your purchase.')
    ).toBeVisible();

    //wait to see if there's an error message
    await this.page.waitForTimeout(5000);
    await expect(this.page.getByText('Connecting with')).toBeVisible();
    await expect(
      this.page.getByText('Please wait while we redirect you to finalize your purchase.')
    ).toBeVisible();
  }
}
