import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgArrowBottom = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 14 15" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M7 1.99a1 1 0 0 1 1 1v7.58l2.46-2.46a1 1 0 0 1 1.41 1.42L7.7 13.69a1 1 0 0 1-1.41 0L2.12 9.53A1 1 0 0 1 3.54 8.1L6 10.57V3a1 1 0 0 1 1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgArrowBottom;
