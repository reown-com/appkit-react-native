import { useState, useEffect } from 'react';
import { StatusBar, useWindowDimensions } from 'react-native';

/**
 * Hook used to get the width of the screen and the padding needed to accomplish portrait and landscape modes.
 * @returns { maxHeight: number, isPortrait: boolean, isLandscape: boolean, padding: number }
 */

type CustomDimensionsType = {
  maxHeight: number;
  isPortrait: boolean;
  isLandscape: boolean;
  padding: number;
};

const MAX_PORTRAIT_PERCENTAGE = 0.9;
const MAX_LANDSCAPE_PERCENTAGE = 0.85;
const IOS_STATUS_BAR_HEIGHT = 20;

const getMaxHeight = (height: number, isPortrait: boolean) => {
  const percentage = isPortrait ? MAX_PORTRAIT_PERCENTAGE : MAX_LANDSCAPE_PERCENTAGE;

  return height * percentage - (StatusBar.currentHeight ?? IOS_STATUS_BAR_HEIGHT);
};

export function useCustomDimensions(): CustomDimensionsType {
  const { width, height } = useWindowDimensions();
  const [isPortrait, setIsPortrait] = useState<boolean>(height > width);
  const [maxHeight, setMaxHeight] = useState<number>(getMaxHeight(height, height > width));
  const [padding, setPadding] = useState<number>(0);

  useEffect(() => {
    const _isPortrait = height > width;

    setMaxHeight(getMaxHeight(height, _isPortrait));
    setIsPortrait(_isPortrait);
    setPadding(_isPortrait ? 0 : (width - height) / 2);
  }, [width, height]);

  return { maxHeight, isPortrait, isLandscape: !isPortrait, padding };
}
