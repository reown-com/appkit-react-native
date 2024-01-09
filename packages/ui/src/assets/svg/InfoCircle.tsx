import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgInfoCircle = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      d="M6 10.49a1 1 0 1 0 2 0v-2a1 1 0 0 0-2 0v2ZM7 4.49a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
    />
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M7 14.99a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgInfoCircle;
