import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgArrowBottom = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 14 15" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M6.998 1.986a1 1 0 0 1 1 1v7.586l2.46-2.46a1 1 0 0 1 1.414 1.413l-4.167 4.168a1 1 0 0 1-1.415 0L2.123 9.525a1 1 0 0 1 1.414-1.414l2.46 2.46V2.987a1 1 0 0 1 1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgArrowBottom;
