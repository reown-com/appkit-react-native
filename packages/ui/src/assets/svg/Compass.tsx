import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgCompass = (props: SvgProps) => (
  <Svg viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M10.009 2.43a7.574 7.574 0 1 0 0 15.148 7.574 7.574 0 0 0 0-15.149ZM.434 10.002a9.574 9.574 0 1 1 19.149 0 9.574 9.574 0 0 1-19.149 0Zm12.539-2.978a1 1 0 0 1 .241 1.024l-1.133 3.398a1 1 0 0 1-.632.633L8.05 13.213a1 1 0 0 1-1.265-1.265l1.133-3.399a1 1 0 0 1 .633-.632l3.398-1.133a1 1 0 0 1 1.024.241ZM9.657 9.656l-.342 1.027 1.027-.342.342-1.027-1.027.342Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgCompass;
