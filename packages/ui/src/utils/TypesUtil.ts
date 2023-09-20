export type ThemeKeys =
  | 'blue-100'
  | 'blue-090'
  | 'blue-080'
  | 'blue-020'
  | 'blue-015'
  | 'blue-010'
  | 'blue-005'
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
  | 'overlay-002'
  | 'overlay-005'
  | 'overlay-010'
  | 'overlay-015'
  | 'overlay-020'
  | 'overlay-025'
  | 'overlay-030';

export type TextType =
  | 'large-500'
  | 'large-600'
  | 'large-700'
  | 'micro-600'
  | 'micro-700'
  | 'paragraph-500'
  | 'paragraph-600'
  | 'paragraph-700'
  | 'small-500'
  | 'small-600'
  | 'tiny-500'
  | 'tiny-600';

export type ColorType =
  | 'blue-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
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
  | 'chevronTop'
  | 'clock'
  | 'close'
  | 'coinPlaceholder'
  | 'compass'
  | 'copy'
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

export type TagType = 'main' | 'shade';

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

export type FlexAlignItemsType = 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch';

export type FlexJustifyContentType =
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';
