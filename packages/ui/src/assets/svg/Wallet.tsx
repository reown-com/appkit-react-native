import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgWallet = (props: SvgProps) => (
  <Svg viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M.005 5.5a3.25 3.25 0 0 1 3.25-3.25h11.25a3.25 3.25 0 0 1 3.25 3.25v.282a3.251 3.251 0 0 1 2.25 3.093v2.25a3.252 3.252 0 0 1-2.25 3.093v.282a3.25 3.25 0 0 1-3.25 3.25H3.255a3.25 3.25 0 0 1-3.25-3.25v-9Zm15.75 8.875H13.38a4.375 4.375 0 1 1 0-8.75h2.375V5.5c0-.69-.56-1.25-1.25-1.25H3.255c-.69 0-1.25.56-1.25 1.25v9c0 .69.56 1.25 1.25 1.25h11.25c.69 0 1.25-.56 1.25-1.25v-.125Zm-2.375-6.75a2.375 2.375 0 1 0 0 4.75h3.375c.69 0 1.25-.56 1.25-1.25v-2.25c0-.69-.56-1.25-1.25-1.25H13.38Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgWallet;
