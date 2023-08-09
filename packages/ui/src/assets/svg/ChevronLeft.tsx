import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgChevronLeft = (props: SvgProps) => (
  <Svg viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M11.04 1.46a1 1 0 0 1 0 1.414L5.914 8l5.126 5.126a1 1 0 1 1-1.414 1.414L3.793 8.707a1 1 0 0 1 0-1.414L9.626 1.46a1 1 0 0 1 1.414 0Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgChevronLeft;
