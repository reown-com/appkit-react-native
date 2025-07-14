import { useSnapshot } from 'valtio';
import { useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import { SnackController, type SnackControllerState } from '@reown/appkit-core-react-native';
import { Snackbar as SnackbarComponent } from '@reown/appkit-ui-react-native';

import styles from './styles';

const getIcon = (variant: SnackControllerState['variant']) => {
  if (variant === 'loading') return 'loading';

  return variant === 'success' ? 'checkmark' : 'close';
};

export function Snackbar() {
  const { open, message, variant, long } = useSnapshot(SnackController.state);
  const componentOpacity = useMemo(() => new Animated.Value(0), []);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (open) {
      Animated.timing(componentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }).start();

      timeoutRef.current = setTimeout(
        () => {
          Animated.timing(componentOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }).start(() => {
            SnackController.hide();
          });
        },
        long ? 15000 : 2200
      );
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (open) {
        SnackController.hide();
        componentOpacity.setValue(0);
      }
    };
  }, [open, long, componentOpacity]);

  return (
    <SnackbarComponent
      message={message}
      icon={getIcon(variant)}
      iconColor={variant === 'success' ? 'success-100' : 'error-100'}
      style={[styles.container, { opacity: componentOpacity }]}
    />
  );
}
