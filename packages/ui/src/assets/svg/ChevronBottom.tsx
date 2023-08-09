import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgChevronBottom = (props: SvgProps) => (
  <Svg viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M1.46 4.96a1 1 0 0 1 1.414 0L8 10.087l5.126-5.127a1 1 0 1 1 1.414 1.415l-5.833 5.833a1 1 0 0 1-1.414 0L1.459 6.375a1 1 0 0 1 0-1.415Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgChevronBottom;
