import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgArrowTop = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M6.997 13.986a1 1 0 0 1-1-1V5.4l-2.46 2.46a1 1 0 0 1-1.414-1.414L6.29 2.28a1 1 0 0 1 1.415 0l4.167 4.167a1 1 0 1 1-1.414 1.415L7.998 5.4v7.585a1 1 0 0 1-1 1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgArrowTop;
