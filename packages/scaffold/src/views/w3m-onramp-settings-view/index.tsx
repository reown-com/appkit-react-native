import { useSnapshot } from 'valtio';
import { memo, useState } from 'react';
import { SvgUri } from 'react-native-svg';
import { FlexView, ListItem, Text, useTheme, Icon, Image } from '@reown/appkit-ui-react-native';
import {
  OnRampController,
  type OnRampCountry,
  type OnRampFiatCurrency
} from '@reown/appkit-core-react-native';

import { SelectorModal } from '../../partials/w3m-selector-modal';
import { Country } from './components/Country';
import { Currency } from '../w3m-onramp-view/components/Currency';
import {
  getModalTitle,
  getItemHeight,
  getModalItems,
  getModalItemKey,
  getModalSearchPlaceholder
} from './utils';
import { styles } from './styles';

type ModalType = 'country' | 'paymentCurrency';

const MemoizedCountry = memo(Country);
const MemoizedCurrency = memo(Currency);

export function OnRampSettingsView() {
  const { paymentCurrency, selectedCountry } = useSnapshot(OnRampController.state);
  const Theme = useTheme();
  const [modalType, setModalType] = useState<ModalType>();
  const [searchValue, setSearchValue] = useState('');

  const onCountryPress = () => {
    setModalType('country');
  };

  const onPaymentCurrencyPress = () => {
    setModalType('paymentCurrency');
  };

  const onPressModalItem = async (item: any) => {
    setModalType(undefined);
    setSearchValue('');
    if (modalType === 'country') {
      await OnRampController.setSelectedCountry(item as OnRampCountry);
    } else if (modalType === 'paymentCurrency') {
      OnRampController.setPaymentCurrency(item as OnRampFiatCurrency);
    }
  };

  const renderModalItem = ({ item }: { item: any }) => {
    if (modalType === 'country') {
      const parsedItem = item as OnRampCountry;

      return (
        <MemoizedCountry
          item={parsedItem}
          onPress={onPressModalItem}
          selected={parsedItem.countryCode === selectedCountry?.countryCode}
        />
      );
    }

    const parsedItem = item as OnRampFiatCurrency;

    return (
      <MemoizedCurrency
        item={parsedItem}
        onPress={onPressModalItem}
        selected={parsedItem.currencyCode === paymentCurrency?.currencyCode}
        title={parsedItem.name}
        subtitle={parsedItem.currencyCode}
      />
    );
  };

  return (
    <>
      <FlexView style={{ backgroundColor: Theme['bg-100'] }} padding={['s', 'm', '4xl', 'm']}>
        <ListItem
          onPress={onCountryPress}
          chevron
          style={styles.firstItem}
          contentStyle={styles.itemContent}
        >
          <FlexView
            alignItems="center"
            justifyContent="center"
            style={[styles.imageContainer, { backgroundColor: Theme['gray-glass-005'] }]}
          >
            <FlexView style={styles.imageBorder}>
              {selectedCountry?.flagImageUrl ? (
                <SvgUri uri={selectedCountry?.flagImageUrl} style={styles.image} />
              ) : undefined}
            </FlexView>
          </FlexView>
          <FlexView>
            <Text color="fg-100">Select Country</Text>
            {selectedCountry?.name && (
              <Text variant="small-400" color="fg-200">
                {selectedCountry?.name}
              </Text>
            )}
          </FlexView>
        </ListItem>
        <ListItem onPress={onPaymentCurrencyPress} chevron contentStyle={styles.itemContent}>
          <FlexView
            alignItems="center"
            justifyContent="center"
            style={[styles.imageContainer, { backgroundColor: Theme['gray-glass-005'] }]}
          >
            <FlexView style={styles.imageBorder}>
              {paymentCurrency?.symbolImageUrl ? (
                <Image source={paymentCurrency.symbolImageUrl} style={styles.image} />
              ) : (
                <Icon name="currencyDollar" size="md" color="fg-100" />
              )}
            </FlexView>
          </FlexView>
          <FlexView>
            <Text color="fg-100">Select Currency</Text>
            {paymentCurrency?.name && (
              <Text variant="small-400" color="fg-200">
                {paymentCurrency?.name}
              </Text>
            )}
          </FlexView>
        </ListItem>
      </FlexView>
      <SelectorModal
        visible={!!modalType}
        onClose={() => setModalType(undefined)}
        items={getModalItems(modalType, searchValue, true)}
        selectedItem={modalType === 'country' ? selectedCountry : paymentCurrency}
        onSearch={setSearchValue}
        renderItem={renderModalItem}
        keyExtractor={(item: any, index: number) => getModalItemKey(modalType, index, item)}
        title={getModalTitle(modalType)}
        itemHeight={getItemHeight(modalType)}
        searchPlaceholder={getModalSearchPlaceholder(modalType)}
      />
    </>
  );
}
