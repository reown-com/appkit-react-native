import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, Modal as RNModal, TouchableOpacity, Animated } from 'react-native';
import styles from './styles';

export interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  onRequestClose: () => void;
  testID: string;
  children: React.ReactNode;
}

export function Modal({ visible, onDismiss, onRequestClose, testID, children }: ModalProps) {
  const { height } = useWindowDimensions();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);

  const onContentLayout = (event: any) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    setCardHeight(measuredHeight);
  };

  // Handle modal visibility
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setShowBackdrop(true);
    }
  }, [visible]);

  // Handle backdrop animation separately
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

  // Handle modal position animation separately
  useEffect(() => {
    let modalAnimation: Animated.CompositeAnimation;

    if (visible && modalVisible) {
      // Calculate the target position (screen height - card height)
      const targetY = cardHeight > 0 ? height - cardHeight : height * 0.2; // fallback to 20% from bottom

      modalAnimation = Animated.spring(translateY, {
        toValue: targetY,
        damping: 18,
        stiffness: 220,
        mass: 1,
        useNativeDriver: true
      });
      modalAnimation.start();
    } else if (!visible && modalVisible) {
      modalAnimation = Animated.spring(translateY, {
        toValue: height,
        damping: 16,
        stiffness: 260,
        mass: 1,
        useNativeDriver: true
      });
      modalAnimation.start(() => {
        setModalVisible(false);
      });
    }

    return () => {
      modalAnimation?.stop();
    };
  }, [visible, modalVisible, translateY, height, cardHeight]);

  // Update position when card height changes (e.g., during navigation)
  useEffect(() => {
    if (visible && cardHeight > 0) {
      const targetY = height - cardHeight;
      Animated.spring(translateY, {
        toValue: targetY,
        damping: 20,
        stiffness: 200,
        mass: 1,
        useNativeDriver: true
      }).start();
    }
  }, [cardHeight, visible, translateY, height]);

  // Reset animation values when modal is fully closed
  useEffect(() => {
    if (!modalVisible) {
      translateY.setValue(height);
      backdropOpacity.setValue(0);
    }
  }, [modalVisible, translateY, backdropOpacity, height]);

  return (
    <>
      {showBackdrop && (
        <Animated.View style={[styles.outerBackdrop, { opacity: backdropOpacity }]} />
      )}
      <RNModal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onDismiss={onDismiss}
        onRequestClose={onRequestClose}
        testID={testID}
      >
        {showBackdrop && (
          <TouchableOpacity
            style={styles.innerBackdropTouchable}
            activeOpacity={1}
            onPress={onDismiss}
          />
        )}
        <Animated.View style={[styles.modal, { transform: [{ translateY }] }]}>
          <Animated.View onLayout={onContentLayout}>{children}</Animated.View>
        </Animated.View>
      </RNModal>
    </>
  );
}
