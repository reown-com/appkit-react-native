/* eslint-disable no-bitwise */

import { Spacing } from './ThemeUtil';
import type { SpacingType, TruncateOptions } from './TypesUtil';

export const UiUtil = {
  getSpacingStyles(spacing: SpacingType | SpacingType[], index: number) {
    if (Array.isArray(spacing)) {
      return spacing[index] ? Spacing[spacing[index] as SpacingType] : undefined;
    } else if (typeof spacing === 'string') {
      return Spacing[spacing];
    }

    return undefined;
  },

  generateAvatarColors(address?: string) {
    if (!address) return ['#f5ccfc', '#dba4f5', '#9a8ee8', '#6493da', '#6ebdea'];

    const hash = address.toLowerCase().replace(/^0x/iu, '');
    const baseColor = hash.substring(0, 6);
    const rgbColor = this.hexToRgb(baseColor);

    const colors: string[] = [];

    for (let i = 0; i < 5; i += 1) {
      const tintedColor = this.tintColor(rgbColor, 0.15 * i);
      colors.push(`rgb(${tintedColor[0]}, ${tintedColor[1]}, ${tintedColor[2]})`);
    }

    return colors;
  },

  hexToRgb(hex: string): [number, number, number] {
    const bigint = parseInt(hex, 16);

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
  },

  tintColor(rgb: [number, number, number], tint: number): [number, number, number] {
    const [r, g, b] = rgb;
    const tintedR = Math.round(r + (255 - r) * tint);
    const tintedG = Math.round(g + (255 - g) * tint);
    const tintedB = Math.round(b + (255 - b) * tint);

    return [tintedR, tintedG, tintedB];
  },

  getTruncateString({ string, charsStart, charsEnd, truncate }: TruncateOptions) {
    if (string.length <= charsStart + charsEnd) {
      return string;
    }

    if (truncate === 'end') {
      return `${string.substring(0, charsStart)}...`;
    } else if (truncate === 'start') {
      return `...${string.substring(string.length - charsEnd)}`;
    }

    return `${string.substring(0, Math.floor(charsStart))}...${string.substring(
      string.length - Math.floor(charsEnd)
    )}`;
  },

  getWalletName(name: string, short = true) {
    return short ? name.split(' ')[0] : name;
  }
};
