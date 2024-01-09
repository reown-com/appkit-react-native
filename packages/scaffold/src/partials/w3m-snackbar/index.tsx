import { useSnapshot } from 'valtio';
import { useEffect, useMemo } from 'react';
import { Animated } from 'react-native';
import { SnackController } from '@web3modal/core-react-native';
import { Snackbar as SnackbarComponent } from '@web3modal/ui-react-native';

import styles from './styles';

export function Snackbar() {
  const { open, message, variant } = useSnapshot(SnackController.state);
  const componentOpacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (open) {
      Animated.timing(componentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }).start();
      setTimeout(() => {
        Animated.timing(componentOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          SnackController.hide();
        });
      }, 2200);
    }
  }, [open, componentOpacity]);

  return (
    <SnackbarComponent
      message={message}
      icon={variant === 'success' ? 'checkmark' : 'close'}
      iconColor={variant === 'success' ? 'success-100' : 'error-100'}
      style={[styles.container, { opacity: componentOpacity }]}
    />
  );
}
