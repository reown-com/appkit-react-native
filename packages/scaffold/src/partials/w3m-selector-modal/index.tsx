import { useSnapshot } from 'valtio';
import Modal from 'react-native-modal';
import { FlatList, View } from 'react-native';
import {
  FlexView,
  IconBox,
  IconLink,
  Image,
  SearchBar,
  Separator,
  Spacing,
  Text,
  useTheme
} from '@reown/appkit-ui-react-native';
import styles from './styles';
import { AssetUtil, NetworkController } from '@reown/appkit-core-react-native';

interface SelectorModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
  items: any[];
  selectedItem?: any;
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  keyExtractor: (item: any, index: number) => string;
  onSearch: (value: string) => void;
  itemHeight?: number;
  showNetwork?: boolean;
}

const SEPARATOR_HEIGHT = Spacing.s;

export function SelectorModal({
  title,
  visible,
  onClose,
  items,
  selectedItem,
  renderItem,
  onSearch,
  keyExtractor,
  itemHeight,
  showNetwork
}: SelectorModalProps) {
  const Theme = useTheme();
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

  const renderSeparator = () => {
    return <View style={{ height: SEPARATOR_HEIGHT }} />;
  };

  return (
    <Modal
      isVisible={visible}
      useNativeDriver
      useNativeDriverForBackdrop
      statusBarTranslucent
      hideModalContentWhileAnimating
      onBackdropPress={onClose}
      onDismiss={onClose}
      style={styles.modal}
    >
      <FlexView style={[styles.container, { backgroundColor: Theme['bg-100'] }]}>
        <FlexView
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
          style={styles.header}
        >
          <IconLink icon="chevronLeft" onPress={onClose} />
          {!!title && <Text variant="paragraph-600">{title}</Text>}
          {showNetwork ? (
            networkImage ? (
              <FlexView alignItems="center" justifyContent="center" style={styles.iconPlaceholder}>
                <Image source={networkImage} style={styles.networkImage} />
              </FlexView>
            ) : (
              <IconBox
                style={styles.iconPlaceholder}
                icon="networkPlaceholder"
                background
                iconColor="fg-200"
                size="sm"
              />
            )
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </FlexView>
        <SearchBar onChangeText={onSearch} style={styles.searchBar} />
        {selectedItem && (
          <FlexView style={styles.selectedContainer}>
            {renderItem({ item: selectedItem })}
            <Separator style={styles.separator} color="gray-glass-020" />
          </FlexView>
        )}
        <FlatList
          data={items}
          renderItem={renderItem}
          fadingEdgeLength={20}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={renderSeparator}
          keyExtractor={keyExtractor}
          getItemLayout={
            itemHeight
              ? (_, index) => ({
                  length: itemHeight + SEPARATOR_HEIGHT,
                  offset: (itemHeight + SEPARATOR_HEIGHT) * index,
                  index
                })
              : undefined
          }
        />
      </FlexView>
    </Modal>
  );
}
