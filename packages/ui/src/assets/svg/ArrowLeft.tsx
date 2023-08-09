import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgArrowLeft = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M12.998 7.986a1 1 0 0 1-1 1H4.412l2.46 2.46a1 1 0 1 1-1.414 1.415L1.29 8.692a1 1 0 0 1 0-1.414L5.458 3.11a1 1 0 0 1 1.414 1.414l-2.46 2.46h7.586a1 1 0 0 1 1 1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgArrowLeft;
