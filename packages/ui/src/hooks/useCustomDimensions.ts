import { useState, useEffect } from 'react';
import { StatusBar, useWindowDimensions } from 'react-native';

/**
 * Hook used to get the width of the screen and the padding needed to accomplish portrait and landscape modes.
 * @returns { width: number, isPortrait: boolean, isLandscape: boolean, padding: number }
 */

type CustomDimensionsType = {
  maxWidth: number;
  maxHeight: number;
  isPortrait: boolean;
  isLandscape: boolean;
  padding: number;
};

const MAX_HEIGHT_PERCENTAGE = 0.9;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 0;

const getMaxHeight = (width: number, height: number) => {
  return Math.max(width, height) * MAX_HEIGHT_PERCENTAGE - STATUS_BAR_HEIGHT;
};

export function useCustomDimensions(): CustomDimensionsType {
  const { width, height } = useWindowDimensions();
  const [maxWidth, setMaxWidth] = useState<number>(Math.min(width, height));
  const [maxHeight, setMaxHeight] = useState<number>(getMaxHeight(width, height));
  const [isPortrait, setIsPortrait] = useState<boolean>(height > width);
  const [padding, setPadding] = useState<number>(0);

  useEffect(() => {
    setMaxWidth(Math.min(width, height));
    setMaxHeight(getMaxHeight(width, height));
    setIsPortrait(height > width);
    setPadding(width < height ? 0 : (width - height) / 2);
  }, [width, height]);

  return { maxWidth, maxHeight, isPortrait, isLandscape: !isPortrait, padding };
}
