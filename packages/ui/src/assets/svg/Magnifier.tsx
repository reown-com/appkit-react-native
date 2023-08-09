import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgMagnifier = (props: SvgProps) => (
  <Svg viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M9.363 4.214a5.143 5.143 0 1 0 0 10.286 5.143 5.143 0 0 0 0-10.286ZM1.648 9.357a7.714 7.714 0 1 1 14.002 4.47l2.51 2.511a1.286 1.286 0 1 1-1.818 1.819l-2.51-2.511A7.714 7.714 0 0 1 1.648 9.357Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgMagnifier;
