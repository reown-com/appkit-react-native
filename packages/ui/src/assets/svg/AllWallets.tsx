import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgAllWallets = (props: SvgProps) => {
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={props.fill}
        d="M10.2 6.6a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0ZM21 6.6a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0ZM10.2 17.4a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0ZM21 17.4a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
export default SvgAllWallets;
