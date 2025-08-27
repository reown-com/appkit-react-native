import { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

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

const OFFSET_PERCENTAGE = 0.9;

const getMaxSize = (value: number) => {
  return value * OFFSET_PERCENTAGE;
};

const checkPortrait = (width: number, height: number) => {
  return height > width;
};

export function useCustomDimensions(): CustomDimensionsType {
  const { width, height } = useWindowDimensions();
  const [maxWidth, setMaxWidth] = useState<number>(getMaxSize(width));
  const [maxHeight, setMaxHeight] = useState<number>(getMaxSize(height));
  const [isPortrait, setIsPortrait] = useState<boolean>(checkPortrait(width, height));
  const [padding, setPadding] = useState<number>(0);

  useEffect(() => {
    setMaxWidth(getMaxSize(width));
    setMaxHeight(getMaxSize(height));
    setIsPortrait(checkPortrait(width, height));
    setPadding(width < height ? 0 : (width - height) / 2);
  }, [width, height]);

  return { maxWidth, maxHeight, isPortrait, isLandscape: !isPortrait, padding };
}
