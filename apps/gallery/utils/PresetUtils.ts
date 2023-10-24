import type {
  ColorType,
  TextType,
  ButtonType,
  IconType,
  ChipType,
  VisualType,
  PlacementType,
  LogoType,
  TagType,
  CardSelectType,
  SizeType
} from '@web3modal/ui-react-native';

export const walletImagesOptions = [
  'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=90369b5c91c6f7fffe308df2b30f3ace',
  'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/bff9cf1f-df19-42ce-f62a-87f04df13c00?projectId=90369b5c91c6f7fffe308df2b30f3ace',
  'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=90369b5c91c6f7fffe308df2b30f3ace',
  'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7e1514ba-932d-415d-1bdb-bccb6c2cbc00?projectId=90369b5c91c6f7fffe308df2b30f3ace'
];

export const walletImageSrc =
  'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=90369b5c91c6f7fffe308df2b30f3ace';

export const networkImageSrc =
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=90369b5c91c6f7fffe308df2b30f3ace';

export const avatarImageSrc =
  'https://i.seadn.io/gcs/files/007a5af0d93d561f87c8d026ddd5179e.png?auto=format&dpr=1&w=1000';

export const wcUri =
  'wc:139520827546986d057472f8bbd7ef0484409458034b61cca59d908563773c7a@2?relay-protocol=irn&symKey=43b5fad11bf07bc8a0aa12231435a4ad3e72e2d1fa257cf191a90ec5b62cb0a';

export const externalLink = 'https://www.fireblocks.com';

export const externalLabel = 'www.fireblocks.com';

export const colorOptions: ColorType[] = [
  'accent-100',
  'error-100',
  'fg-100',
  'fg-200',
  'fg-300',
  'inverse-000',
  'inverse-100',
  'success-100'
];

export const textOptions: TextType[] = [
  'medium-title-400',
  'medium-title-500',
  'medium-title-600',
  'small-title-400',
  'small-title-500',
  'small-title-600',
  'large-400',
  'large-500',
  'large-600',
  'medium-400',
  'medium-500',
  'medium-600',
  'paragraph-400',
  'paragraph-500',
  'paragraph-600',
  'small-400',
  'small-500',
  'small-600',
  'tiny-400',
  'tiny-500',
  'tiny-600',
  'micro-600',
  'micro-700'
];

export const buttonOptions: ButtonType[] = ['fill', 'accent', 'shade'];

export const chipOptions: ChipType[] = ['fill', 'shade', 'transparent'];

export const tooltipOptions: PlacementType[] = ['top', 'bottom', 'left', 'right'];

export const tagOptions: TagType[] = ['main', 'shade', 'success', 'error'];

export const iconOptions: IconType[] = [
  'allWallets',
  'apple',
  'arrowBottom',
  'arrowLeft',
  'arrowRight',
  'arrowTop',
  'browser',
  'checkmark',
  'chevronBottom',
  'chevronLeft',
  'chevronRight',
  'chevronTop',
  'clock',
  'close',
  'coinPlaceholder',
  'compass',
  'copy',
  'cursor',
  'desktop',
  'disconnect',
  'discord',
  'etherscan',
  'extension',
  'externalLink',
  'facebook',
  'filters',
  'github',
  'google',
  'helpCircle',
  'infoCircle',
  'mail',
  'mobile',
  'networkPlaceholder',
  'nftPlaceholder',
  'off',
  'qrCode',
  'refresh',
  'search',
  'swapHorizontal',
  'swapVertical',
  'telegram',
  'twitch',
  'twitterIcon',
  'twitter',
  'wallet',
  'walletConnect',
  'walletPlaceholder',
  'warningCircle'
];

export const visualOptions: VisualType[] = [
  'browser',
  'dao',
  'defi',
  'defiAlt',
  'eth',
  'layers',
  'lock',
  'login',
  'network',
  'nft',
  'noun',
  'profile',
  'system'
];

export const logoOptions: LogoType[] = [
  'apple',
  'discord',
  'facebook',
  'github',
  'google',
  'telegram',
  'twitch',
  'twitter'
];

export const cardSelectOptions: CardSelectType[] = ['wallet', 'network'];

export const inputSizeOptions: SizeType[] = ['sm', 'md'];
