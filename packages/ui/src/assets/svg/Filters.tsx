import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgFilters = (props: SvgProps) => (
  <Svg viewBox="0 0 16 17" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M0 3.001a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1Zm2.632 5.25a1 1 0 0 1 1-1h8.75a1 1 0 1 1 0 2h-8.75a1 1 0 0 1-1-1Zm2.618 5.25a1 1 0 0 1 1-1h3.5a1 1 0 0 1 0 2h-3.5a1 1 0 0 1-1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgFilters;
