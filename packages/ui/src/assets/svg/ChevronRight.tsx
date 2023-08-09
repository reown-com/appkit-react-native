import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgChevronRight = (props: SvgProps) => (
  <Svg viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M4.96 14.541a1 1 0 0 1 0-1.414L10.086 8 4.96 2.874A1 1 0 0 1 6.374 1.46l5.833 5.834a1 1 0 0 1 0 1.414L6.374 14.54a1 1 0 0 1-1.414 0Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgChevronRight;
