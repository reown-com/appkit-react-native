import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';
const SvgMore = (props: SvgProps) => (
  <Svg viewBox="0 0 41 40" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillOpacity=".05"
      d="M.6 20a20 20 0 1 1 40 0 20 20 0 0 1-40 0Z"
    />
    <Path
      fill="#949E9E"
      d="M15.6 20.31a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM23.1 20.31a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM28.1 22.81a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
    />
    <Circle cx={20} cy={19.886} r={19.5} stroke="#fff" strokeOpacity={0.1} fill="none" />
  </Svg>
);
export default SvgMore;
