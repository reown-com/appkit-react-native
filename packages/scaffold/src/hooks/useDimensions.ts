import { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

export function useDimensions() {
  const { width, height } = useWindowDimensions();
  const [viewWidth, setViewWidth] = useState<number>(Math.min(width, height));
  const [isPortrait, setIsPortrait] = useState<boolean>(height > width);
  const [padding, setPadding] = useState<number>(0);

  useEffect(() => {
    setViewWidth(Math.min(width, height));
    setIsPortrait(height > width);
    setPadding(width < height ? 0 : (width - height) / 2);
  }, [width, height]);

  return { width: viewWidth, isPortrait, isLandscape: !isPortrait, padding };
}
