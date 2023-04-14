import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export function useOrientation() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const callback = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', callback);

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isPortrait: dimensions.height >= dimensions.width,
  };
}
