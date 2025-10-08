import { useEffect, useRef, useState } from 'react';
import {
  useWindowDimensions,
  Modal as RNModal,
  type ModalProps as RNModalProps,
  Animated,
  Pressable,
  View
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

export type ModalProps = Pick<
  RNModalProps,
  'visible' | 'onDismiss' | 'testID' | 'onRequestClose'
> & {
  children: React.ReactNode;
  onBackdropPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Modal({ visible, onBackdropPress, onRequestClose, testID, children }: ModalProps) {
  const { height } = useWindowDimensions();
  const Theme = useTheme();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const onContentLayout = (event: any) => {
    const { height: measuredHeight } = event.nativeEvent.layout;

    setContentHeight(measuredHeight > height ? height : measuredHeight);
  };

  // Handle modal visibility
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setShowBackdrop(true);
    }
  }, [visible]);

  // Handle backdrop animation
  useEffect(() => {
    let backdropAnimation: Animated.CompositeAnimation;

    if (visible) {
      backdropAnimation = Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      });
      backdropAnimation.start();
    } else if (modalVisible) {
      backdropAnimation = Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      });
      backdropAnimation.start(() => {
        setShowBackdrop(false);
      });
    }

    return () => {
      backdropAnimation?.stop();
    };
  }, [visible, modalVisible, backdropOpacity]);

  // Handle modal position animation + visibility
  useEffect(() => {
    let modalAnimation: Animated.CompositeAnimation;

    if (visible && modalVisible) {
      // Calculate the target position (screen height - card height)
      const targetY = contentHeight > 0 ? height - contentHeight : height * 0.2; // fallback to 20% from bottom

      modalAnimation = Animated.spring(translateY, {
        toValue: targetY,
        damping: 25,
        stiffness: 220,
        mass: 1,
        useNativeDriver: true
      });
      modalAnimation.start();
    } else if (!visible && modalVisible) {
      // Hide modal to the bottom of the screen. Not using spring as it blocks the UI for a bit when closed
      modalAnimation = Animated.timing(translateY, {
        toValue: height,
        duration: 150,
        useNativeDriver: true
      });
      modalAnimation.start(() => {
        setModalVisible(false);
      });
    }

    return () => {
      modalAnimation?.stop();
    };
  }, [visible, modalVisible, translateY, height, contentHeight]);

  // Reset animation values when modal is fully closed
  useEffect(() => {
    if (!modalVisible) {
      translateY.setValue(height);
      backdropOpacity.setValue(0);
    }
  }, [modalVisible, translateY, backdropOpacity, height]);

  return (
    <RNModal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onRequestClose}
      testID={testID}
    >
      {showBackdrop ? (
        <AnimatedPressable
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          onPress={onBackdropPress}
        />
      ) : null}
      <Animated.View style={[styles.modal, { transform: [{ translateY }] }]}>
        <Animated.View onLayout={onContentLayout}>{children}</Animated.View>
        <View style={[styles.bottomBackground, { backgroundColor: Theme['bg-100'] }]} />
      </Animated.View>
    </RNModal>
  );
}
