import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { TIMEOUTS } from '../constants';

export class OnRampPage {
  private readonly buyCryptoButton: Locator;
  private readonly accountButton: Locator;

  constructor(public readonly page: Page) {
    this.accountButton = this.page.getByTestId('account-button');
    this.buyCryptoButton = this.page.getByTestId('button-onramp');
  }

  async openBuyCryptoModal() {
    // Make sure we're connected and can see the account button
    await expect(this.accountButton).toBeVisible({ timeout: 10000 });
    await this.accountButton.click();
    // Wait for the buy crypto button to be visible in the account modal
    await expect(this.buyCryptoButton).toBeVisible({ timeout: 5000 });
    await this.buyCryptoButton.click();
    // Wait for the onramp view to initialize
    await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  async clickSelectCurrency() {
    const currencySelector = this.page.getByTestId('currency-selector');
    await expect(currencySelector).toBeVisible({ timeout: 5000 });
    await currencySelector.click();
  }

  async selectCurrency(currency: string) {
    const currencyItem = this.page.getByTestId(`currency-item-${currency}`);
    await expect(currencyItem).toBeVisible({ timeout: 5000 });
    await currencyItem.click();
    // Wait for any UI updates after selection
    await this.page.waitForTimeout(500);
  }

  async enterAmount(amount: number) {
    const amountInput = this.page.getByTestId('currency-input');
    await expect(amountInput).toBeVisible({ timeout: 5000 });

    // press buttons from digital numeric keyboard, finding elements by text. Split amount into digits
    const digits = amount.toString().replace('.', ',').split('');
    for (const digit of digits) {
      await this.page.getByTestId(`key-${digit}`).click();
    }
    // Wait for quote generation
    await this.page.waitForTimeout(1000);
  }

  async clickPaymentMethod() {
    const paymentMethodButton = this.page.getByTestId('payment-method-button');
    await expect(paymentMethodButton).toBeVisible({ timeout: 5000 });
    await paymentMethodButton.click();
  }

  async selectPaymentMethod(name: string) {
    // Select the first available payment method
    const paymentMethod = this.page.getByText(name);
    await expect(paymentMethod).toBeVisible({ timeout: 5000 });
    await paymentMethod.click();
    // Wait for UI updates
    await this.page.waitForTimeout(500);
  }

  async selectSuggestedValue() {
    const suggestedValue = this.page.getByTestId(new RegExp('suggested-value-.')).last();
    await expect(suggestedValue).toBeVisible({ timeout: 5000 });
    await suggestedValue.click();
    // Wait for quote generation
    await this.page.waitForTimeout(1000);
  }

  async clickContinue() {
    const continueButton = this.page.getByTestId('button-continue');
    await expect(continueButton).toBeVisible({ timeout: 5000 });
    await expect(continueButton).toBeEnabled({ timeout: 5000 });
    await continueButton.click();
    // Wait for navigation
    await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  async clickConfirmCheckout() {
    const confirmButton = this.page.getByTestId('button-confirm');
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toBeEnabled({ timeout: 5000 });
    await confirmButton.click();
    // Wait for navigation
    await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  async openSettings() {
    const settingsButton = this.page.getByTestId('button-onramp-settings');
    await expect(settingsButton).toBeVisible({ timeout: 5000 });
    await settingsButton.click();
    // Wait for navigation
    await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  async completeCheckout() {
    // Find and click the final checkout button
    const checkoutButton = this.page.getByText('Checkout');
    await expect(checkoutButton).toBeVisible({ timeout: 5000 });
    await expect(checkoutButton).toBeEnabled({ timeout: 5000 });
    await checkoutButton.click();

    // In a real test, this would involve more steps to complete the checkout process
    // For this example, we'll simulate a successful completion
    await this.page.waitForTimeout(2000);
  }

  async closeSelectorModal() {
    const backButton = this.page.getByTestId('selector-modal-button-back');
    await expect(backButton).toBeVisible({ timeout: 5000 });
    await backButton.click();
    // Wait for navigation
    await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
  }

  async closePaymentModal() {
    const backButton = this.page.getByTestId('payment-modal-button-back');
    await expect(backButton).toBeVisible({ timeout: 5000 });
    await backButton.click();
    // Wait for navigation
    await this.page.waitForTimeout(TIMEOUTS.ANIMATION);
  }
}
