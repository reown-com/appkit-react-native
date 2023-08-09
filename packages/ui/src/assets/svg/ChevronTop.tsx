import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgChevronTop = (props: SvgProps) => (
  <Svg viewBox="0 0 16 17" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M14.54 11.041a1 1 0 0 1-1.414 0L8 5.915l-5.126 5.126A1 1 0 1 1 1.46 9.627l5.833-5.833a1 1 0 0 1 1.414 0l5.834 5.833a1 1 0 0 1 0 1.414Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgChevronTop;
