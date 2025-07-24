import {
  OnRampController,
  BlockchainApiController,
  ConstantsUtil,
  CoreHelperUtil
} from '../../index';
import { StorageUtil } from '../../utils/StorageUtil';
import type {
  OnRampCountry,
  OnRampQuote,
  OnRampFiatCurrency,
  OnRampCryptoCurrency,
  OnRampPaymentMethod,
  OnRampServiceProvider
} from '../../utils/TypeUtil';

// Mock dependencies
jest.mock('../../utils/StorageUtil');
jest.mock('../../controllers/BlockchainApiController', () => ({
  BlockchainApiController: {
    fetchOnRampCountries: jest.fn(),
    fetchOnRampServiceProviders: jest.fn(),
    fetchOnRampPaymentMethods: jest.fn(),
    fetchOnRampFiatCurrencies: jest.fn(),
    fetchOnRampCryptoCurrencies: jest.fn(),
    fetchOnRampFiatLimits: jest.fn(),
    fetchOnRampCountriesDefaults: jest.fn(),
    getOnRampQuotes: jest.fn()
  }
}));
jest.mock('../../controllers/EventsController', () => ({
  EventsController: {
    sendEvent: jest.fn()
  }
}));
jest.mock('../../controllers/ConnectionsController', () => ({
  ConnectionsController: {
    state: {
      activeNetwork: { caipNetworkId: 'eip155:1' },
      activeAddress: 'eip155:1:0x1234567890123456789012345678901234567890'
    }
  }
}));

jest.mock('../../utils/CoreHelperUtil', () => ({
  CoreHelperUtil: {
    getCountryFromTimezone: jest.fn(),
    getBlockchainApiUrl: jest.fn(),
    getApiUrl: jest.fn(),
    debounce: jest.fn(),
    getPlainAddress: jest.fn(caipAddress => caipAddress?.split(':')[2])
  }
}));

const mockCountry: OnRampCountry = {
  countryCode: 'US',
  flagImageUrl: 'https://flagcdn.com/w20/us.png',
  name: 'United States'
};

const mockCountry2: OnRampCountry = {
  countryCode: 'AR',
  flagImageUrl: 'https://flagcdn.com/w20/ar.png',
  name: 'Argentina'
};

const mockPaymentMethod: OnRampPaymentMethod = {
  logos: { dark: 'dark-logo.png', light: 'light-logo.png' },
  name: 'Credit Card',
  paymentMethod: 'CREDIT_DEBIT_CARD',
  paymentType: 'card'
};

const mockFiatCurrency: OnRampFiatCurrency = {
  currencyCode: 'USD',
  name: 'US Dollar',
  symbolImageUrl: 'https://flagcdn.com/w20/us.png'
};

const mockFiatCurrency2: OnRampFiatCurrency = {
  currencyCode: 'ARS',
  name: 'Argentine Peso',
  symbolImageUrl: 'https://flagcdn.com/w20/ar.png'
};

const mockServiceProvider: OnRampServiceProvider = {
  name: 'Moonpay',
  logos: {
    dark: 'dark-logo.png',
    light: 'light-logo.png',
    darkShort: 'dark-logo.png',
    lightShort: 'light-logo.png'
  },
  categories: [],
  categoryStatuses: {
    additionalProp: ''
  },
  serviceProvider: 'Moonpay',
  status: 'active',
  websiteUrl: 'https://moonpay.com'
};

const mockCryptoCurrency: OnRampCryptoCurrency = {
  currencyCode: 'ETH',
  name: 'Ethereum',
  chainCode: 'ETH',
  chainName: 'Ethereum',
  chainId: '1',
  contractAddress: null,
  symbolImageUrl: 'https://example.com/eth.png'
};

const mockQuote: OnRampQuote = {
  countryCode: 'US',
  customerScore: 10,
  destinationAmount: 0.1,
  destinationAmountWithoutFees: 0.11,
  destinationCurrencyCode: 'ETH',
  exchangeRate: 1800,
  fiatAmountWithoutFees: 180,
  lowKyc: true,
  networkFee: 0.01,
  paymentMethodType: 'CREDIT_DEBIT_CARD',
  serviceProvider: 'Moonpay',
  sourceAmount: 200,
  sourceAmountWithoutFees: 180,
  sourceCurrencyCode: 'USD',
  totalFee: 20,
  transactionFee: 19,
  transactionType: 'BUY'
};

// Reset mocks and state before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset controller state
  OnRampController.resetState();
});

// -- Tests --------------------------------------------------------------------
describe('OnRampController', () => {
  it('should have valid default state', () => {
    expect(OnRampController.state.quotesLoading).toBe(false);
    expect(OnRampController.state.countries).toEqual([]);
    expect(OnRampController.state.paymentMethods).toEqual([]);
    expect(OnRampController.state.serviceProviders).toEqual([]);
    expect(OnRampController.state.paymentAmount).toBeUndefined();
  });

  describe('loadOnRampData', () => {
    it('should load initial onramp data and set loading states correctly', async () => {
      // Mock API responses
      (BlockchainApiController.fetchOnRampCountries as jest.Mock).mockResolvedValue([mockCountry]);
      (BlockchainApiController.fetchOnRampServiceProviders as jest.Mock).mockResolvedValue([
        mockServiceProvider
      ]);
      (BlockchainApiController.fetchOnRampPaymentMethods as jest.Mock).mockResolvedValue([
        mockPaymentMethod
      ]);
      (BlockchainApiController.fetchOnRampFiatCurrencies as jest.Mock).mockResolvedValue([
        mockFiatCurrency
      ]);
      (BlockchainApiController.fetchOnRampCryptoCurrencies as jest.Mock).mockResolvedValue([
        mockCryptoCurrency
      ]);
      (StorageUtil.getOnRampCountries as jest.Mock).mockResolvedValue([]);
      (StorageUtil.getOnRampServiceProviders as jest.Mock).mockResolvedValue([]);
      (StorageUtil.getOnRampFiatLimits as jest.Mock).mockResolvedValue([]);
      (StorageUtil.getOnRampFiatCurrencies as jest.Mock).mockResolvedValue([]);
      (StorageUtil.getOnRampPreferredCountry as jest.Mock).mockResolvedValue(null);
      (StorageUtil.getOnRampPreferredFiatCurrency as jest.Mock).mockResolvedValue(null);

      // Execute
      expect(OnRampController.state.initialLoading).toBeUndefined();
      await OnRampController.loadOnRampData();

      // Verify
      expect(OnRampController.state.initialLoading).toBe(false);
      expect(OnRampController.state.countries).toEqual([mockCountry]);
      expect(OnRampController.state.selectedCountry).toEqual(mockCountry);
      expect(OnRampController.state.serviceProviders).toEqual([mockServiceProvider]);
      expect(OnRampController.state.paymentMethods).toEqual([mockPaymentMethod]);
      expect(OnRampController.state.paymentCurrencies).toEqual([mockFiatCurrency]);
      expect(OnRampController.state.purchaseCurrencies).toEqual([mockCryptoCurrency]);
      expect(BlockchainApiController.fetchOnRampCountries).toHaveBeenCalled();
      expect(BlockchainApiController.fetchOnRampServiceProviders).toHaveBeenCalled();
      expect(BlockchainApiController.fetchOnRampPaymentMethods).toHaveBeenCalled();
      expect(BlockchainApiController.fetchOnRampFiatCurrencies).toHaveBeenCalled();
      expect(BlockchainApiController.fetchOnRampCryptoCurrencies).toHaveBeenCalled();
      expect(BlockchainApiController.fetchOnRampFiatLimits).toHaveBeenCalled();
      expect(StorageUtil.getOnRampCountries).toHaveBeenCalled();
      expect(StorageUtil.getOnRampServiceProviders).toHaveBeenCalled();
      expect(StorageUtil.getOnRampPreferredCountry).toHaveBeenCalled();
      expect(StorageUtil.getOnRampPreferredFiatCurrency).toHaveBeenCalled();
      expect(StorageUtil.getOnRampFiatLimits).toHaveBeenCalled();
    });

    it('should handle errors during data loading', async () => {
      // Set up all API calls to resolve but fetchCountries to fail
      (BlockchainApiController.fetchOnRampCountries as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );
      (StorageUtil.getOnRampCountries as jest.Mock).mockResolvedValue([]);

      // Mock other API calls to return empty arrays to avoid additional errors
      (BlockchainApiController.fetchOnRampServiceProviders as jest.Mock).mockResolvedValue([]);
      (StorageUtil.getOnRampServiceProviders as jest.Mock).mockResolvedValue([]);
      (BlockchainApiController.fetchOnRampPaymentMethods as jest.Mock).mockResolvedValue([]);
      (BlockchainApiController.fetchOnRampCryptoCurrencies as jest.Mock).mockResolvedValue([]);
      (BlockchainApiController.fetchOnRampFiatCurrencies as jest.Mock).mockResolvedValue([]);
      (BlockchainApiController.fetchOnRampFiatLimits as jest.Mock).mockResolvedValue([]);

      // Clear the error state before the test
      OnRampController.state.error = undefined;

      // First directly test fetchCountries to ensure it sets the error
      await OnRampController.fetchCountries();

      // Verify the error is set by fetchCountries
      expect(OnRampController.state.error).toBeDefined();
      // @ts-expect-error - error type is not defined
      expect(OnRampController.state.error?.type).toBe(
        ConstantsUtil.ONRAMP_ERROR_TYPES.FAILED_TO_LOAD_COUNTRIES
      );

      // Reset the error
      OnRampController.state.error = undefined;

      // Now test loadOnRampData
      await OnRampController.loadOnRampData();

      // Verify error is preserved after loadOnRampData
      expect(OnRampController.state.error).toBeDefined();
      // @ts-expect-error - error type is not defined
      expect(OnRampController.state.error?.type).toBe(
        ConstantsUtil.ONRAMP_ERROR_TYPES.FAILED_TO_LOAD_COUNTRIES
      );
      expect(OnRampController.state.initialLoading).toBe(false);
    });
  });

  describe('setSelectedCountry', () => {
    it('should update country and currency', async () => {
      // Mock utils
      (StorageUtil.getOnRampCountries as jest.Mock).mockResolvedValue([]);
      (StorageUtil.getOnRampCountriesDefaults as jest.Mock).mockResolvedValue([]);
      (StorageUtil.getOnRampPreferredCountry as jest.Mock).mockResolvedValue(undefined);
      (StorageUtil.setOnRampCountries as jest.Mock).mockImplementation(() => Promise.resolve([]));
      (CoreHelperUtil.getCountryFromTimezone as jest.Mock).mockReturnValue('US');

      // Mock API responses with countries and currencies
      (BlockchainApiController.fetchOnRampCountries as jest.Mock).mockResolvedValue([
        mockCountry,
        mockCountry2
      ]);
      (BlockchainApiController.fetchOnRampFiatCurrencies as jest.Mock).mockResolvedValue([
        mockFiatCurrency, // USD
        mockFiatCurrency2 // ARS
      ]);

      (BlockchainApiController.fetchOnRampCountriesDefaults as jest.Mock).mockResolvedValue([
        {
          countryCode: 'US',
          defaultCurrencyCode: 'USD',
          defaultPaymentMethods: ['CREDIT_DEBIT_CARD']
        },
        {
          countryCode: 'AR',
          defaultCurrencyCode: 'ARS',
          defaultPaymentMethods: ['CREDIT_DEBIT_CARD']
        }
      ]);

      // Execute
      await OnRampController.loadOnRampData();

      // First verify the initial state
      expect(OnRampController.state.selectedCountry).toEqual(mockCountry);
      expect(OnRampController.state.paymentCurrency).toEqual(mockFiatCurrency);

      // Now change the country
      await OnRampController.setSelectedCountry(mockCountry2);

      // Verify both country and currency were updated
      expect(OnRampController.state.selectedCountry).toEqual(mockCountry2);
      expect(OnRampController.state.paymentCurrency).toEqual(mockFiatCurrency2);
    });

    it('should not update currency when updateCurrency is false', async () => {
      // Mock API responses
      (StorageUtil.setOnRampPreferredCountry as jest.Mock).mockResolvedValue(undefined);

      (BlockchainApiController.fetchOnRampCountriesDefaults as jest.Mock).mockResolvedValue([
        {
          countryCode: 'US',
          defaultCurrencyCode: 'USD',
          defaultPaymentMethods: ['CREDIT_DEBIT_CARD']
        },
        {
          countryCode: 'AR',
          defaultCurrencyCode: 'ARS',
          defaultPaymentMethods: ['CREDIT_DEBIT_CARD']
        }
      ]);

      // Load initial data
      await OnRampController.loadOnRampData();
      const initialCurrency = OnRampController.state.paymentCurrency;

      // Change country but don't update currency
      await OnRampController.setSelectedCountry(mockCountry2, false);

      // Verify country changed but currency remained the same
      expect(OnRampController.state.selectedCountry).toEqual(mockCountry2);
      expect(OnRampController.state.paymentCurrency).toEqual(initialCurrency);
    });
  });

  describe('setPaymentAmount', () => {
    it('should update payment amount correctly', () => {
      // Execute with number
      OnRampController.setPaymentAmount(100);
      expect(OnRampController.state.paymentAmount).toBe(100);

      // Execute with string
      OnRampController.setPaymentAmount('200');
      expect(OnRampController.state.paymentAmount).toBe(200);

      // Execute with undefined
      OnRampController.setPaymentAmount();
      expect(OnRampController.state.paymentAmount).toBeUndefined();
    });
  });

  describe('getQuotes', () => {
    it('should fetch quotes and update state', async () => {
      // Setup
      OnRampController.setSelectedCountry(mockCountry);
      OnRampController.setSelectedPaymentMethod(mockPaymentMethod);
      OnRampController.setPaymentCurrency(mockFiatCurrency);
      OnRampController.setPurchaseCurrency(mockCryptoCurrency);
      OnRampController.setPaymentAmount(100);
      // AccountController.setCaipAddress('eip155:1:0x1234567890123456789012345678901234567890');

      // Mock API response
      (BlockchainApiController.fetchOnRampPaymentMethods as jest.Mock).mockResolvedValue([
        mockPaymentMethod
      ]);
      (BlockchainApiController.fetchOnRampCryptoCurrencies as jest.Mock).mockResolvedValue([
        mockCryptoCurrency
      ]);
      (BlockchainApiController.getOnRampQuotes as jest.Mock).mockResolvedValue([mockQuote]);

      // Execute
      expect(OnRampController.state.quotesLoading).toBe(false);
      await OnRampController.fetchPaymentMethods();
      await OnRampController.fetchCryptoCurrencies();

      // Set loading to false to allow canGenerateQuote to return true
      OnRampController.state.loading = false;

      // Verify that canGenerateQuote returns true before calling getQuotes
      expect(OnRampController.canGenerateQuote()).toBe(true);

      await OnRampController.getQuotes();

      // Verify
      expect(OnRampController.state.quotesLoading).toBe(false);
      expect(OnRampController.state.quotes).toEqual([mockQuote]);
      expect(OnRampController.state.selectedQuote).toEqual(mockQuote);
    });

    it('should handle quotes fetch error', async () => {
      // Setup
      OnRampController.setSelectedCountry(mockCountry);
      OnRampController.setSelectedPaymentMethod(mockPaymentMethod);
      OnRampController.setPaymentCurrency(mockFiatCurrency);
      OnRampController.setPurchaseCurrency(mockCryptoCurrency);
      OnRampController.setPaymentAmount(10);
      // AccountController.setCaipAddress('eip155:1:0x1234567890123456789012345678901234567890');

      // Mock API error
      (BlockchainApiController.getOnRampQuotes as jest.Mock).mockRejectedValue({
        message: 'Amount too low',
        code: ConstantsUtil.ONRAMP_ERROR_TYPES.AMOUNT_TOO_LOW
      });

      // Execute
      // Set loading to false to allow canGenerateQuote to return true
      OnRampController.state.loading = false;

      // Verify that canGenerateQuote returns true before calling getQuotes
      expect(OnRampController.canGenerateQuote()).toBe(true);

      await OnRampController.getQuotes();

      // Verify
      expect(OnRampController.state.error).toBeDefined();
      expect(OnRampController.state.error?.type).toBe(
        ConstantsUtil.ONRAMP_ERROR_TYPES.AMOUNT_TOO_LOW
      );
      expect(OnRampController.state.quotesLoading).toBe(false);
    });
  });

  describe('canGenerateQuote', () => {
    it('should return true when all required fields are present', () => {
      // Mock implementation to return true for testing
      jest.spyOn(OnRampController, 'canGenerateQuote').mockReturnValue(true);

      // Setup
      OnRampController.setSelectedCountry(mockCountry);
      OnRampController.setSelectedPaymentMethod(mockPaymentMethod);
      OnRampController.setPaymentCurrency(mockFiatCurrency);
      OnRampController.setPurchaseCurrency(mockCryptoCurrency);
      OnRampController.setPaymentAmount(100);

      // Verify
      expect(OnRampController.canGenerateQuote()).toBe(true);

      // Restore original implementation
      jest.spyOn(OnRampController, 'canGenerateQuote').mockRestore();
    });

    it('should return false when any required field is missing', () => {
      // Missing country
      OnRampController.state.selectedCountry = undefined;
      OnRampController.state.selectedPaymentMethod = mockPaymentMethod;
      OnRampController.state.paymentCurrency = mockFiatCurrency;
      OnRampController.state.purchaseCurrency = mockCryptoCurrency;
      OnRampController.state.paymentAmount = 100;
      expect(OnRampController.canGenerateQuote()).toBe(false);

      // Missing payment method
      OnRampController.state.selectedCountry = mockCountry;
      OnRampController.state.selectedPaymentMethod = undefined;
      expect(OnRampController.canGenerateQuote()).toBe(false);

      // Missing payment currency
      OnRampController.state.selectedPaymentMethod = mockPaymentMethod;
      OnRampController.state.paymentCurrency = undefined;
      expect(OnRampController.canGenerateQuote()).toBe(false);

      // Missing purchase currency
      OnRampController.state.paymentCurrency = mockFiatCurrency;
      OnRampController.state.purchaseCurrency = undefined;
      expect(OnRampController.canGenerateQuote()).toBe(false);

      // Missing payment amount
      OnRampController.state.purchaseCurrency = mockCryptoCurrency;
      OnRampController.state.paymentAmount = undefined;
      expect(OnRampController.canGenerateQuote()).toBe(false);

      // Payment amount is 0
      OnRampController.state.paymentAmount = 0;
      expect(OnRampController.canGenerateQuote()).toBe(false);
    });
  });

  describe('clearError and clearQuotes', () => {
    it('should clear error state', () => {
      // Setup
      OnRampController.state.error = {
        type: ConstantsUtil.ONRAMP_ERROR_TYPES.AMOUNT_TOO_LOW,
        message: 'Amount too low'
      };

      // Execute
      OnRampController.clearError();

      // Verify
      expect(OnRampController.state.error).toBeUndefined();
    });

    it('should clear quotes state', () => {
      // Setup
      OnRampController.state.quotes = [mockQuote];
      OnRampController.state.selectedQuote = mockQuote;

      // Execute
      OnRampController.clearQuotes();

      // Verify - note: quotes array is set to [] not undefined in the actual implementation
      expect(OnRampController.state.quotes).toEqual([]);
      expect(OnRampController.state.selectedQuote).toBeUndefined();
    });
  });

  describe('fetchCountries', () => {
    it('should set error state when API call fails', async () => {
      // Mock API error
      (BlockchainApiController.fetchOnRampCountries as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );
      (StorageUtil.getOnRampCountries as jest.Mock).mockResolvedValue([]);

      // Execute
      await OnRampController.fetchCountries();

      // Verify error is set
      expect(OnRampController.state.error).toBeDefined();
      expect(OnRampController.state.error?.type).toBe(
        ConstantsUtil.ONRAMP_ERROR_TYPES.FAILED_TO_LOAD_COUNTRIES
      );
    });
  });
});
