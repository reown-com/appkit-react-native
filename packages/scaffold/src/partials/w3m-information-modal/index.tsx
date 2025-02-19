import { useCallback, useRef, useState } from 'react';
import { useEffect } from 'react';
import {
  FlexView,
  Text,
  type IconType,
  IconBox,
  useTheme,
  Button
} from '@reown/appkit-ui-react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import styles from './styles';
import type { LayoutChangeEvent } from 'react-native';

export interface ModalData {
  title?: string;
  description?: string;
}

interface InformationModalProps {
  iconName: IconType;
  title?: ModalData['title'];
  description?: ModalData['description'];
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [height, setHeight] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing
      handleComponent={null}
      backgroundStyle={{ backgroundColor: Theme['bg-200'] }}
    >
      <BottomSheetView style={{ height }}>
        <FlexView alignItems="center" padding="2xl" onLayout={onLayout}>
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
      </BottomSheetView>
    </BottomSheet>
  );
}
