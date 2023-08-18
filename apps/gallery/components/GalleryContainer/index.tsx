import React from 'react';
import { View } from 'react-native';

interface GalleryContainerProps {
  width?: number;
  children?: React.ReactNode;
}

export function GalleryContainer({ width, children }: GalleryContainerProps) {
  return <View style={{ width }}>{children}</View>;
}
