import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgWarning = (props: SvgProps) => (
  <Svg width={18} height={16} viewBox="0 0 18 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      d="M10 5.083a1 1 0 0 0-2 0v2.334a1 1 0 0 0 2 0V5.083Zm-1 7A1.167 1.167 0 1 0 9 9.75a1.167 1.167 0 0 0 0 2.333Z"
    />
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M9 0A8.001 8.001 0 0 0 .998 8 8 8 0 0 0 9 16a8.001 8.001 0 0 0 8.003-8c0-4.418-3.583-8-8.003-8ZM2.998 8A6 6 0 0 1 9 2a6.001 6.001 0 1 1 0 12 6.001 6.001 0 0 1-6.002-6Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgWarning;
