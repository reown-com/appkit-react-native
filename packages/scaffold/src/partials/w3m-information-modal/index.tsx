import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable as RNPressable } from 'react-native';
import {
  FlexView,
  Text,
  type IconType,
  IconBox,
  useTheme,
  Button
} from '@reown/appkit-ui-react-native';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 0.7 : 0,
      duration: 400,
      useNativeDriver: false
    }).start();
  }, [visible, fadeAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onDismiss={onClose}
    >
      <FlexView style={styles.container}>
        <AnimatedPressable
          onPress={onClose}
          style={[
            styles.backdrop,
            !visible && styles.hidden,
            { backgroundColor: Theme['inverse-000'], opacity: fadeAnim }
          ]}
        />
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
            <Text>Got it</Text>
          </Button>
        </FlexView>
      </FlexView>
    </Modal>
  );
}
