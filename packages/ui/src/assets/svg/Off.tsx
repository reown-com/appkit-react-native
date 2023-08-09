import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgOff = (props: SvgProps) => (
  <Svg viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M8.002 0a1 1 0 0 1 1 1v5.385a1 1 0 0 1-2 0V1a1 1 0 0 1 1-1Zm-2.74 2.6a1 1 0 0 1-.28 1.387 5.462 5.462 0 1 0 6.039 0 1 1 0 1 1 1.107-1.666 7.462 7.462 0 1 1-8.253 0 1 1 0 0 1 1.386.28Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgOff;
