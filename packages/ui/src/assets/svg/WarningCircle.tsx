import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgWarningCircle = (props: SvgProps) => (
  <Svg viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      d="M11.005 6.667a1 1 0 1 0-2 0v2.666a1 1 0 0 0 2 0V6.667Zm-1 7.833a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
    />
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M10.005 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-7 9a7 7 0 1 1 14 0 7 7 0 0 1-14 0Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgWarningCircle;
