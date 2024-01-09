import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgChevronRightSmall = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M4.29282 13.6929C3.90229 13.3024 3.90229 12.6693 4.29282 12.2787L8.5856 7.98595L4.29282 3.69316C3.90229 3.30263 3.90229 2.66947 4.29282 2.27895C4.68334 1.88842 5.31651 1.88842 5.70703 2.27895L10.7069 7.27884C11.0974 7.66936 11.0974 8.30253 10.7069 8.69305L5.70703 13.6929C5.31651 14.0835 4.68334 14.0835 4.29282 13.6929Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgChevronRightSmall;
