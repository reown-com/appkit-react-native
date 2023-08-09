import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgClose = (props: SvgProps) => (
  <Svg viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M2.543 2.543a1 1 0 0 1 1.414 0L8 6.586l4.043-4.043a1 1 0 1 1 1.414 1.414L9.414 8l4.043 4.043a1 1 0 0 1-1.414 1.414L8 9.414l-4.043 4.043a1 1 0 0 1-1.414-1.414L6.586 8 2.543 3.957a1 1 0 0 1 0-1.414Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgClose;
