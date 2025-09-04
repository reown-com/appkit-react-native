import { ITEM_HEIGHT as COUNTRY_ITEM_HEIGHT } from './components/Country';
import { ITEM_HEIGHT as CURRENCY_ITEM_HEIGHT } from '../w3m-onramp-view/components/Currency';
import { OnRampController } from '@reown/appkit-core-react-native';
import { type OnRampCountry, type OnRampFiatCurrency } from '@reown/appkit-common-react-native';

// -------------------------- Types --------------------------
type ModalType = 'country' | 'paymentCurrency';

// -------------------------- Constants --------------------------
const MODAL_TITLES: Record<ModalType, string> = {
  country: 'Select Country',
  paymentCurrency: 'Select Currency'
};

const MODAL_SEARCH_PLACEHOLDERS: Record<ModalType, string> = {
  country: 'Search country',
  paymentCurrency: 'Search currency'
};

const MODAL_EMPTY_TITLES: Record<ModalType, string> = {
  country: 'No countries found',
  paymentCurrency: 'No currencies found'
};

const MODAL_EMPTY_DESCRIPTIONS: Record<ModalType, string> = {
  country: "There's no available countries",
  paymentCurrency: "There's no available currencies"
};

const ITEM_HEIGHTS: Record<ModalType, number> = {
  country: COUNTRY_ITEM_HEIGHT,
  paymentCurrency: CURRENCY_ITEM_HEIGHT
};

const KEY_EXTRACTORS: Record<ModalType, (item: any) => string> = {
  country: (item: OnRampCountry) => item.countryCode,
  paymentCurrency: (item: OnRampFiatCurrency) => item.currencyCode
};

// -------------------------- Utils --------------------------
export const getItemHeight = (type?: ModalType) => {
  return type ? ITEM_HEIGHTS[type] : 0;
};

export const getModalTitle = (type?: ModalType) => {
  return type ? MODAL_TITLES[type] : undefined;
};

export const getModalSearchPlaceholder = (type?: ModalType) => {
  return type ? MODAL_SEARCH_PLACEHOLDERS[type] : undefined;
};

export const getModalEmptyTitle = (type?: ModalType) => {
  return type ? MODAL_EMPTY_TITLES[type] : undefined;
};

export const getModalEmptyDescription = (type?: ModalType) => {
  return type ? MODAL_EMPTY_DESCRIPTIONS[type] : undefined;
};

const searchFilter = (
  item: { name: string; currencyCode?: string; countryCode?: string },
  searchValue: string
) => {
  const search = searchValue.toLowerCase();

  return (
    item.name.toLowerCase().includes(search) ||
    (item.currencyCode?.toLowerCase().includes(search) ?? false) ||
    (item.countryCode?.toLowerCase().includes(search) ?? false)
  );
};

export const getModalItemKey = (type: ModalType | undefined, index: number, item: any) => {
  return type ? KEY_EXTRACTORS[type](item) : index.toString();
};

export const getModalItems = (
  type?: Exclude<ModalType, 'quotes'>,
  searchValue?: string,
  filterSelected?: boolean
) => {
  const items = {
    country: () =>
      filterSelected
        ? OnRampController.state.countries.filter(
            c => c.countryCode !== OnRampController.state.selectedCountry?.countryCode
          )
        : OnRampController.state.countries,
    paymentCurrency: () =>
      filterSelected
        ? OnRampController.state.paymentCurrencies?.filter(
            pc => pc.currencyCode !== OnRampController.state.paymentCurrency?.currencyCode
          )
        : OnRampController.state.paymentCurrencies
  };

  const result = items[type!]?.() || [];

  return searchValue
    ? result.filter((item: { name: string; currencyCode?: string }) =>
        searchFilter(item, searchValue)
      )
    : result;
};
