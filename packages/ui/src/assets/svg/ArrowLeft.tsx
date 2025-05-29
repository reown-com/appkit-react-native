import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgArrowLeft = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill ?? '#fff'}
      fillRule="evenodd"
      d="M13 7.99a1 1 0 0 1-1 1H4.4l2.46 2.46a1 1 0 1 1-1.41 1.41L1.29 8.7a1 1 0 0 1 0-1.41L5.46 3.1a1 1 0 0 1 1.41 1.42L4.41 6.99H12a1 1 0 0 1 1 1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgArrowLeft;
