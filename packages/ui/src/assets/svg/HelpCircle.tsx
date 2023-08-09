import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgHelpCircle = (props: SvgProps) => (
  <Svg viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      d="M8.514 5.66a.834.834 0 0 0-.57-.193c-.148.007-.35.09-.528.272-.177.184-.25.384-.25.525a1 1 0 0 1-2 0c0-.756.348-1.435.814-1.916.466-.481 1.131-.848 1.881-.879 1.364-.057 2.898.932 2.898 2.795 0 1.244-.804 1.862-1.246 2.202l-.041.032c-.467.36-.51.436-.51.65a1 1 0 1 1-2 0c0-1.244.805-1.862 1.247-2.202l.04-.031c.468-.361.51-.437.51-.65 0-.31-.114-.492-.245-.605Zm.603 6.213a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Z"
    />
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgHelpCircle;
