import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgClock = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M7 2.986a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-7 5a7 7 0 1 1 14 0 7 7 0 0 1-14 0Zm7-4a1 1 0 0 1 1 1v2.586l1.85 1.85a1 1 0 0 1-1.414 1.414L6.293 8.693A1 1 0 0 1 6 7.986v-3a1 1 0 0 1 1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgClock;
