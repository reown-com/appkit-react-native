import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgCheckmark = (props: SvgProps) => (
  <Svg viewBox="0 0 10 10" fill="none" {...props}>
    <Path
      fill={props.fill ?? '#fff'}
      fillRule="evenodd"
      d="M8.78372 1.95266C9.08607 2.20616 9.12561 2.6567 8.87202 2.95895L4.67713 7.95895C4.54853 8.11223 4.36153 8.20458 4.16161 8.21352C3.96169 8.22246 3.76718 8.14718 3.6254 8.006L1.17437 5.56526C0.894791 5.28685 0.893915 4.83459 1.17241 4.55511C1.45091 4.27562 1.90333 4.27475 2.1829 4.55315L4.08243 6.44471L7.77709 2.04094C8.03068 1.73869 8.48136 1.69916 8.78372 1.95266Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgCheckmark;
