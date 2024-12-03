import Modal from 'react-native-modal';
import {
  FlexView,
  Text,
  type IconType,
  IconBox,
  useTheme,
  Button
} from '@reown/appkit-ui-react-native';
import styles from './styles';

interface InformationModalProps {
  iconName: IconType;
  title?: string;
  description?: string;
  visible: boolean;
  onClose: () => void;
}

export function InformationModal({
  iconName,
  title,
  description,
  visible,
  onClose
}: InformationModalProps) {
  const Theme = useTheme();

  return (
    <Modal
      isVisible={visible}
      useNativeDriver
      useNativeDriverForBackdrop
      onBackdropPress={onClose}
      onDismiss={onClose}
      style={styles.modal}
    >
      <FlexView
        style={[
          styles.content,
          {
            backgroundColor: Theme['bg-200']
          }
        ]}
        padding="2xl"
      >
        <IconBox icon={iconName} size="lg" background />
        {!!title && (
          <Text variant="paragraph-500" style={styles.title}>
            {title}
          </Text>
        )}

        {!!description && (
          <Text variant="small-400" color="fg-150" center>
            {description}
          </Text>
        )}
        <Button onPress={onClose} variant="fill" style={styles.button}>
          Got it
        </Button>
      </FlexView>
    </Modal>
  );
}
