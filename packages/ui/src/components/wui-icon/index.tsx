import type { SvgProps } from 'react-native-svg';
import type { ColorType, IconType, SizeType, ThemeKeys } from '../../utils/TypesUtil';

// -- Svg's-------------------------------- //
import AllWalletsSvg from '../../assets/svg/AllWallets';
import AppleSvg from '../../assets/svg/Apple';
import ArrowBottomSvg from '../../assets/svg/ArrowBottom';
import ArrowBottomCircleSvg from '../../assets/svg/ArrowBottomCircle';
import ArrowLeftSvg from '../../assets/svg/ArrowLeft';
import ArrowRightSvg from '../../assets/svg/ArrowRight';
import ArrowTopSvg from '../../assets/svg/ArrowTop';
import BrowserSvg from '../../assets/svg/Browser';
import CardSvg from '../../assets/svg/Card';
import CheckmarkSvg from '../../assets/svg/Checkmark';
import ChevronBottomSvg from '../../assets/svg/ChevronBottom';
import ChevronLeftSvg from '../../assets/svg/ChevronLeft';
import ChevronRightSvg from '../../assets/svg/ChevronRight';
import ChevronRightSmallSvg from '../../assets/svg/ChevronRightSmall';
import ChevronTopSvg from '../../assets/svg/ChevronTop';
import ClockSvg from '../../assets/svg/Clock';
import CloseSvg from '../../assets/svg/Close';
import CompassSvg from '../../assets/svg/Compass';
import CoinPlaceholderSvg from '../../assets/svg/CoinPlaceholder';
import CopySvg from '../../assets/svg/Copy';
import CopySmallSvg from '../../assets/svg/CopySmall';
import CursorSvg from '../../assets/svg/Cursor';
import CurrencyDollarSvg from '../../assets/svg/CurrencyDollar';
import DesktopSvg from '../../assets/svg/Desktop';
import DisconnectSvg from '../../assets/svg/Disconnect';
import DiscordSvg from '../../assets/svg/Discord';
import EtherscanSvg from '../../assets/svg/Etherscan';
import ExtensionSvg from '../../assets/svg/Extension';
import ExternalLinkSvg from '../../assets/svg/ExternalLink';
import FacebookSvg from '../../assets/svg/Facebook';
import FarcasterSvg from '../../assets/svg/Farcaster';
import FarcasterSquareSvg from '../../assets/svg/FarcasterSquare';
import FiltersSvg from '../../assets/svg/Filters';
import GithubSvg from '../../assets/svg/Github';
import GoogleSvg from '../../assets/svg/Google';
import HelpCircleSvg from '../../assets/svg/HelpCircle';
import InfoCircleSvg from '../../assets/svg/InfoCircle';
import MailSvg from '../../assets/svg/Mail';
import MobileSvg from '../../assets/svg/Mobile';
import MoreSvg from '../../assets/svg/More';
import NetworkPlaceholderSvg from '../../assets/svg/NetworkPlaceholder';
import NftPlaceholderSvg from '../../assets/svg/NftPlaceholder';
import OffSvg from '../../assets/svg/Off';
import PaperplaneSvg from '../../assets/svg/Paperplane';
import QrCodeSvg from '../../assets/svg/QrCode';
import RecycleHorizontalSvg from '../../assets/svg/RecycleHorizontal';
import RefreshSvg from '../../assets/svg/Refresh';
import SearchSvg from '../../assets/svg/Search';
import SettingsSvg from '../../assets/svg/Settings';
import SwapHorizontalSvg from '../../assets/svg/SwapHorizontal';
import SwapVerticalSvg from '../../assets/svg/SwapVertical';
import TelegramSvg from '../../assets/svg/Telegram';
import TwitchSvg from '../../assets/svg/Twitch';
import VerifySvg from '../../assets/svg/Verify';
import WalletConnectSvg, { WalletConnectLightBrownSvg } from '../../assets/svg/WalletConnect';
import WalletSvg from '../../assets/svg/Wallet';
import WalletSmallSvg from '../../assets/svg/WalletSmall';
import WarningCircleSvg from '../../assets/svg/WarningCircle';
import WalletPlaceholderSvg from '../../assets/svg/WalletPlaceholder';
import XSvg from '../../assets/svg/X';
import { useTheme } from '../../hooks/useTheme';
import { IconSize } from '../../utils/ThemeUtil';

const svgOptions: Record<IconType, (props: SvgProps) => JSX.Element> = {
  allWallets: AllWalletsSvg,
  apple: AppleSvg,
  arrowBottom: ArrowBottomSvg,
  arrowBottomCircle: ArrowBottomCircleSvg,
  arrowLeft: ArrowLeftSvg,
  arrowRight: ArrowRightSvg,
  arrowTop: ArrowTopSvg,
  browser: BrowserSvg,
  card: CardSvg,
  checkmark: CheckmarkSvg,
  chevronBottom: ChevronBottomSvg,
  chevronLeft: ChevronLeftSvg,
  chevronRight: ChevronRightSvg,
  chevronRightSmall: ChevronRightSmallSvg,
  chevronTop: ChevronTopSvg,
  clock: ClockSvg,
  close: CloseSvg,
  compass: CompassSvg,
  coinPlaceholder: CoinPlaceholderSvg,
  copy: CopySvg,
  copySmall: CopySmallSvg,
  cursor: CursorSvg,
  currencyDollar: CurrencyDollarSvg,
  desktop: DesktopSvg,
  disconnect: DisconnectSvg,
  discord: DiscordSvg,
  etherscan: EtherscanSvg,
  extension: ExtensionSvg,
  externalLink: ExternalLinkSvg,
  facebook: FacebookSvg,
  farcaster: FarcasterSvg,
  farcasterSquare: FarcasterSquareSvg,
  filters: FiltersSvg,
  github: GithubSvg,
  google: GoogleSvg,
  helpCircle: HelpCircleSvg,
  infoCircle: InfoCircleSvg,
  mail: MailSvg,
  mobile: MobileSvg,
  more: MoreSvg,
  networkPlaceholder: NetworkPlaceholderSvg,
  nftPlaceholder: NftPlaceholderSvg,
  off: OffSvg,
  paperplane: PaperplaneSvg,
  qrCode: QrCodeSvg,
  recycleHorizontal: RecycleHorizontalSvg,
  refresh: RefreshSvg,
  search: SearchSvg,
  settings: SettingsSvg,
  swapHorizontal: SwapHorizontalSvg,
  swapVertical: SwapVerticalSvg,
  telegram: TelegramSvg,
  twitch: TwitchSvg,
  verify: VerifySvg,
  wallet: WalletSvg,
  walletSmall: WalletSmallSvg,
  warningCircle: WarningCircleSvg,
  walletConnect: WalletConnectSvg,
  walletConnectLightBrown: WalletConnectLightBrownSvg,
  walletPlaceholder: WalletPlaceholderSvg,
  x: XSvg
};

export type IconProps = SvgProps & {
  name: IconType;
  size?: SizeType;
  color?: ColorType;
  style?: SvgProps['style'];
};

export function Icon({
  name,
  width,
  height,
  color = 'fg-100',
  size = 'md',
  style,
  ...rest
}: IconProps) {
  const Theme = useTheme();
  const Component = svgOptions[name];

  return (
    <Component
      fill={Theme[color as ThemeKeys]}
      width={width || IconSize[size]}
      height={height || IconSize[size]}
      style={style}
      {...rest}
    />
  );
}
