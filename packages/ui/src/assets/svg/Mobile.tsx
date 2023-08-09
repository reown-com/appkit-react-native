import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgMobile = (props: SvgProps) => (
  <Svg viewBox="0 0 21 20" fill="none" {...props}>
    <Path fill={props.fill || '#fff'} d="M10.818 5.813a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M3.005 4.75A4.75 4.75 0 0 1 7.755 0h4.5a4.75 4.75 0 0 1 4.75 4.75v10.5a4.75 4.75 0 0 1-4.75 4.75h-4.5a4.75 4.75 0 0 1-4.75-4.75V4.75ZM7.755 2a2.75 2.75 0 0 0-2.75 2.75v10.5A2.75 2.75 0 0 0 7.755 18h4.5a2.75 2.75 0 0 0 2.75-2.75V4.75A2.75 2.75 0 0 0 12.255 2h-4.5Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgMobile;
