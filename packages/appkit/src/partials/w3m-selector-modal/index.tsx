import { useSnapshot } from 'valtio';
import { FlatList, View, Modal } from 'react-native';
import {
  FlexView,
  IconBox,
  IconLink,
  Image,
  SearchBar,
  Separator,
  Spacing,
  Text,
  useCustomDimensions,
  useTheme
} from '@reown/appkit-ui-react-native';
import { AssetController, AssetUtil, ConnectionsController } from '@reown/appkit-core-react-native';
import { Placeholder } from '../w3m-placeholder';
import styles from './styles';

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
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
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
  searchPlaceholder,
  keyExtractor,
  itemHeight,
  showNetwork,
  emptyTitle = 'No tokens found',
  emptyDescription = "There's no available tokens for this network"
}: SelectorModalProps) {
  const Theme = useTheme();
  const { maxHeight } = useCustomDimensions();
  const { activeNetwork } = useSnapshot(ConnectionsController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork, networkImages);

  const renderSeparator = () => {
    return <View style={{ height: SEPARATOR_HEIGHT }} />;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <FlatList
          data={items}
          renderItem={renderItem}
          fadingEdgeLength={20}
          automaticallyAdjustKeyboardInsets={false}
          keyboardShouldPersistTaps="always"
          style={[styles.container, { backgroundColor: Theme['bg-100'], maxHeight }]}
          ListHeaderComponentStyle={styles.header}
          ListEmptyComponent={
            <Placeholder icon="coinPlaceholder" title={emptyTitle} description={emptyDescription} />
          }
          ListHeaderComponent={
            <>
              <FlexView
                alignItems="center"
                justifyContent="space-between"
                flexDirection="row"
                style={styles.headerTop}
              >
                <IconLink
                  icon="chevronLeft"
                  onPress={onClose}
                  testID="selector-modal-button-back"
                />
                {!!title && <Text variant="paragraph-600">{title}</Text>}
                {showNetwork ? (
                  networkImage ? (
                    <FlexView
                      alignItems="center"
                      justifyContent="center"
                      style={styles.iconPlaceholder}
                    >
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
              <SearchBar
                onChangeText={onSearch}
                style={styles.searchBar}
                placeholder={searchPlaceholder}
              />
              {selectedItem ? (
                <FlexView>
                  {renderItem({ item: selectedItem })}
                  <Separator style={styles.separator} color="gray-glass-005" />
                </FlexView>
              ) : null}
            </>
          }
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
      </View>
    </Modal>
  );
}
