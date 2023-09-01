import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgCursor = (props: SvgProps) => (
  <Svg viewBox="0 0 12 4" {...props} fill="none">
    <Path fill={props.fill || '#fff'} d="M.5 0h12L8.9 3.13a3.76 3.76 0 0 1-4.8 0L.5 0Z" />
  </Svg>
);
export default SvgCursor;
