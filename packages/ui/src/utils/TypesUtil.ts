export type ThemeKeys =
  | 'accent-100'
  | 'accent-090'
  | 'accent-020'
  | 'accent-glass-090'
  | 'accent-glass-080'
  | 'accent-glass-020'
  | 'accent-glass-015'
  | 'accent-glass-010'
  | 'accent-glass-005'
  | 'accent-glass-002'
  | 'fg-100'
  | 'fg-125'
  | 'fg-150'
  | 'fg-175'
  | 'fg-200'
  | 'fg-225'
  | 'fg-250'
  | 'fg-275'
  | 'fg-300'
  | 'bg-100'
  | 'bg-125'
  | 'bg-150'
  | 'bg-175'
  | 'bg-200'
  | 'bg-225'
  | 'bg-250'
  | 'bg-275'
  | 'bg-300'
  | 'inverse-100'
  | 'inverse-000'
  | 'success-100'
  | 'error-100'
  | 'teal-100'
  | 'magenta-100'
  | 'indigo-100'
  | 'orange-100'
  | 'purple-100'
  | 'yellow-100'
  | 'gray-glass-001'
  | 'gray-glass-002'
  | 'gray-glass-005'
  | 'gray-glass-010'
  | 'gray-glass-015'
  | 'gray-glass-020'
  | 'gray-glass-025'
  | 'gray-glass-030'
  | 'gray-glass-060'
  | 'gray-glass-080'
  | 'gray-glass-090'
  | 'icon-box-bg-error-100'
  | 'icon-box-bg-success-100';

export type TextType =
  | 'medium-title-400'
  | 'medium-title-500'
  | 'medium-title-600'
  | 'small-title-400'
  | 'small-title-500'
  | 'small-title-600'
  | 'large-400'
  | 'large-500'
  | 'large-600'
  | 'medium-400'
  | 'medium-500'
  | 'medium-600'
  | 'paragraph-400'
  | 'paragraph-500'
  | 'paragraph-600'
  | 'small-400'
  | 'small-500'
  | 'small-600'
  | 'tiny-400'
  | 'tiny-500'
  | 'tiny-600'
  | 'micro-600'
  | 'micro-700';

export type ColorType =
  | 'accent-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
  | 'fg-250'
  | 'fg-275'
  | 'fg-300'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100';

export type SizeType = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';

export type PlacementType = 'bottom' | 'left' | 'right' | 'top';

export type ButtonType = 'accent' | 'fill' | 'shade';

export type ChipType = 'fill' | 'shade' | 'transparent';

export type IconType =
  | 'allWallets'
  | 'apple'
  | 'arrowBottom'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowTop'
  | 'browser'
  | 'checkmark'
  | 'chevronBottom'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronRightSmall'
  | 'chevronTop'
  | 'clock'
  | 'close'
  | 'coinPlaceholder'
  | 'compass'
  | 'copy'
  | 'copySmall'
  | 'cursor'
  | 'desktop'
  | 'disconnect'
  | 'discord'
  | 'etherscan'
  | 'extension'
  | 'externalLink'
  | 'facebook'
  | 'filters'
  | 'github'
  | 'google'
  | 'helpCircle'
  | 'infoCircle'
  | 'mail'
  | 'mobile'
  | 'networkPlaceholder'
  | 'nftPlaceholder'
  | 'off'
  | 'qrCode'
  | 'refresh'
  | 'search'
  | 'swapHorizontal'
  | 'swapVertical'
  | 'telegram'
  | 'twitch'
  | 'twitter'
  | 'twitterIcon'
  | 'wallet'
  | 'walletSmall'
  | 'walletConnect'
  | 'walletPlaceholder'
  | 'warningCircle';

export type VisualType =
  | 'browser'
  | 'dao'
  | 'defi'
  | 'defiAlt'
  | 'eth'
  | 'layers'
  | 'lock'
  | 'login'
  | 'network'
  | 'nft'
  | 'noun'
  | 'profile'
  | 'system';

export type LogoType =
  | 'apple'
  | 'discord'
  | 'facebook'
  | 'github'
  | 'google'
  | 'telegram'
  | 'twitch'
  | 'twitter';

export type TagType = 'main' | 'shade' | 'error' | 'success';

export type CardSelectType = 'wallet' | 'network';

export type TabOptionType = {
  icon: IconType;
  label: string;
};

export type SpacingType =
  | '0'
  | '4xs'
  | '3xs'
  | '2xs'
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

export type BorderRadiusType = Exclude<SpacingType, 'xl' | 'xxl'>;

export type FlexDirectionType = 'column-reverse' | 'column' | 'row-reverse' | 'row';

export type FlexWrapType = 'nowrap' | 'wrap-reverse' | 'wrap';

export type FlexGrowType = 0 | 1;

export type FlexShrinkType = 0 | 1;

export type FlexAlignType = 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch';

export type FlexJustifyContentType =
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';

export type TruncateType = 'start' | 'middle' | 'end';

export type TruncateOptions = {
  string: string;
  charsStart: number;
  charsEnd: number;
  truncate: TruncateType;
};
