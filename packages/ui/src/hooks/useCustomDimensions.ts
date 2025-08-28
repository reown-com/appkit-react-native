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

const getMaxHeight = (height: number) => {
  return height * MAX_HEIGHT_PERCENTAGE - (StatusBar.currentHeight ?? 0);
};

export function useCustomDimensions(): CustomDimensionsType {
  const { width, height } = useWindowDimensions();
  const [maxWidth, setMaxWidth] = useState<number>(width);
  const [maxHeight, setMaxHeight] = useState<number>(getMaxHeight(height));
  const [isPortrait, setIsPortrait] = useState<boolean>(height > width);
  const [padding, setPadding] = useState<number>(0);

  useEffect(() => {
    setMaxWidth(width);
    setMaxHeight(getMaxHeight(height));
    setIsPortrait(height > width);
    setPadding(width < height ? 0 : (width - height) / 2);
  }, [width, height]);

  return { maxWidth, maxHeight, isPortrait, isLandscape: !isPortrait, padding };
}
