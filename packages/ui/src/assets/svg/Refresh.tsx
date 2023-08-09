import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgRefresh = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M10.06 1.026a1 1 0 0 0-.692 1.233l.473 1.682a5.862 5.862 0 1 0 2.875 6.88 1 1 0 1 0-1.915-.577 3.863 3.863 0 1 1-1.816-4.493l-1.871.527a1 1 0 0 0 .542 1.925l4.098-1.153a1 1 0 0 0 .692-1.234l-1.153-4.099a1 1 0 0 0-1.234-.691Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgRefresh;
