import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgSwapVertical = (props: SvgProps) => (
  <Svg viewBox="0 0 17 17" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M4.7.304a1 1 0 0 1 1.414 0L9.528 3.72a1 1 0 0 1-1.414 1.414L6.407 3.426v6.463a1 1 0 1 1-2 0V3.426L2.699 5.133A1 1 0 1 1 1.285 3.72L4.699.304Zm7.877 4.805a1 1 0 0 1 1 1v6.464l1.708-1.708a1 1 0 0 1 1.414 1.414l-3.415 3.415a1 1 0 0 1-1.414 0L8.456 12.28a1 1 0 1 1 1.414-1.414l1.707 1.708V6.109a1 1 0 0 1 1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgSwapVertical;
