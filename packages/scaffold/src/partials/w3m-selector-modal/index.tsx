import Modal from 'react-native-modal';
import { FlatList, View } from 'react-native';
import {
  FlexView,
  IconLink,
  SearchBar,
  Spacing,
  Text,
  useTheme
} from '@reown/appkit-ui-react-native';
import styles from './styles';

interface SelectorModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
  items: any[];
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  keyExtractor: (item: any, index: number) => string;
  onSearch: (value: string) => void;
  itemHeight?: number;
}

const SEPARATOR_HEIGHT = Spacing.s;

export function SelectorModal({
  title,
  visible,
  onClose,
  items,
  renderItem,
  onSearch,
  keyExtractor,
  itemHeight
}: SelectorModalProps) {
  const Theme = useTheme();

  const renderSeparator = () => {
    return <View style={{ height: SEPARATOR_HEIGHT }} />;
  };

  return (
    <Modal
      isVisible={visible}
      useNativeDriver
      useNativeDriverForBackdrop
      onBackdropPress={onClose}
      onDismiss={onClose}
      style={styles.modal}
    >
      <FlexView style={[styles.container, { backgroundColor: Theme['bg-200'] }]}>
        <FlexView
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
          style={styles.header}
        >
          <IconLink icon="arrowLeft" onPress={onClose} />
          {!!title && <Text variant="medium-600">{title}</Text>}
          <View style={styles.iconPlaceholder} />
        </FlexView>
        <SearchBar onChangeText={onSearch} style={styles.searchBar} />
        <FlatList
          data={items}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
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
