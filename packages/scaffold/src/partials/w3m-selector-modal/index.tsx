import Modal from 'react-native-modal';
import { FlatList, View } from 'react-native';
import { FlexView, IconLink, Text, useTheme } from '@reown/appkit-ui-react-native';
import styles from './styles';

interface SelectorModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
  items: any[];
  renderItem: ({ item }: { item: any }) => React.ReactElement;
}

export function SelectorModal({ title, visible, onClose, items, renderItem }: SelectorModalProps) {
  const Theme = useTheme();

  const renderSeparator = () => {
    return <View style={styles.separator} />;
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
      <FlatList
        data={items}
        renderItem={renderItem}
        style={[
          styles.container,
          {
            backgroundColor: Theme['bg-200']
          }
        ]}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={
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
        }
      />
    </Modal>
  );
}
