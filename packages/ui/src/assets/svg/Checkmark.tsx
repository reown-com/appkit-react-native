import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgCheckmark = (props: SvgProps) => (
  <Svg viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M16.98 2.728a1 1 0 0 1 .3 1.382L9.014 16.971a1 1 0 0 1-1.61.1L2.81 11.559a1 1 0 1 1 1.536-1.28l3.721 4.465 7.531-11.715a1 1 0 0 1 1.382-.3Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgCheckmark;
