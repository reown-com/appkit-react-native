import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgCheckmark = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M13.653 2.132a.75.75 0 0 1 .233 1.035L7.319 13.535a1 1 0 0 1-1.625.09L2.162 9.21a.75.75 0 0 1 1.172-.937l2.874 3.593a.25.25 0 0 0 .406-.023l6.004-9.48a.75.75 0 0 1 1.035-.232Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgCheckmark;
