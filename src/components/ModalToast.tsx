import { useEffect, useMemo } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { useSnapshot } from 'valtio';

import useTheme from '../hooks/useTheme';
import { ToastCtrl } from '../controllers/ToastCtrl';
import Checkmark from '../assets/Checkmark';
import Warning from '../assets/Warning';
import Web3Text from './Web3Text';

function ModalToast() {
  const Theme = useTheme();
  const { open, message, variant } = useSnapshot(ToastCtrl.state);
  const toastOpacity = useMemo(() => new Animated.Value(0), []);
  const Icon = variant === 'success' ? Checkmark : Warning;
  const iconColor = variant === 'success' ? Theme.accent : Theme.negative;

  useEffect(() => {
    if (open) {
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          ToastCtrl.closeToast();
        });
      }, 2200);
    }
  }, [open, toastOpacity]);

  return open ? (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: Theme.glass,
          borderColor: Theme.overlayThin,
          opacity: toastOpacity,
        },
      ]}
    >
      <Icon width={16} fill={iconColor} style={styles.icon} />
      <Web3Text style={styles.text} numberOfLines={1}>
        {message}
      </Web3Text>
    </Animated.View>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    padding: 9,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    bottom: 25,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.12)',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        borderColor: 'rgba(0, 0, 0, 0.12)',
        borderWidth: 1,
        elevation: 4,
      },
    }),
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
  },
});

export default ModalToast;
