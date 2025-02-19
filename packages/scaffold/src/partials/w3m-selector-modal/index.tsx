import { View } from 'react-native';
import {
  FlexView,
  IconLink,
  SearchBar,
  Separator,
  Spacing,
  Text,
  useTheme
} from '@reown/appkit-ui-react-native';
import styles from './styles';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { useRef, useEffect } from 'react';
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
  itemHeight
}: SelectorModalProps) {
  const Theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const renderSeparator = () => {
    return <View style={{ height: SEPARATOR_HEIGHT }} />;
  };

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.7} onPress={onClose} />
  );

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      index={-1}
      ref={bottomSheetRef}
      enableDynamicSizing
      handleComponent={null}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Theme['bg-100'] }}
    >
      <FlexView>
        <FlexView
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
          style={styles.header}
        >
          <IconLink icon="chevronLeft" onPress={onClose} />
          {!!title && <Text variant="paragraph-600">{title}</Text>}
          <View style={styles.iconPlaceholder} />
        </FlexView>
        <SearchBar onChangeText={onSearch} style={styles.searchBar} />
        {selectedItem && (
          <FlexView style={styles.selectedContainer}>
            {renderItem({ item: selectedItem })}
            <Separator style={styles.separator} color="gray-glass-020" />
          </FlexView>
        )}
      </FlexView>
      <BottomSheetFlatList
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
    </BottomSheet>
  );
}
