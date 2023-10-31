import { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

export function useDimensions() {
  const { width, height } = useWindowDimensions();
  const [viewWidth, setViewWidth] = useState<number>(Math.min(width, height));
  const [isPortrait, setIsPortrait] = useState<boolean>(height > width);

  useEffect(() => {
    setViewWidth(Math.min(width, height));
    setIsPortrait(height > width);
  }, [width, height]);

  return { width: viewWidth, isPortrait, isLandscape: !isPortrait };
}
