import { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Hook used to get the width of the screen and the padding needed to accomplish portrait and landscape modes.
 * @returns { width: number, isPortrait: boolean, isLandscape: boolean, padding: number }
 */
export function useCustomDimensions() {
  const { width, height } = useWindowDimensions();
  const [maxWidth, setMaxWidth] = useState<number>(Math.min(width, height));
  const [isPortrait, setIsPortrait] = useState<boolean>(height > width);
  const [padding, setPadding] = useState<number>(0);

  useEffect(() => {
    setMaxWidth(Math.min(width, height));
    setIsPortrait(height > width);
    setPadding(width < height ? 0 : (width - height) / 2);
  }, [width, height]);

  return { maxWidth, isPortrait, isLandscape: !isPortrait, padding };
}
