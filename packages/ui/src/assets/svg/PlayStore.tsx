import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgPlayStore = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 36 36" {...props}>
    <Path
      d="M0 8a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8Z"
      fill="#fff"
      fillOpacity="0.05"
    />
    <Path
      d="m18.262 17.513-8.944 9.49v.01a2.417 2.417 0 0 0 3.56 1.452l.026-.017 10.061-5.803-4.703-5.132Z"
      fill="#EA4335"
    />
    <Path
      d="m27.307 15.9-.008-.008-4.342-2.52-4.896 4.36 4.913 4.912 4.325-2.494a2.42 2.42 0 0 0 .008-4.25Z"
      fill="#FBBC04"
    />
    <Path
      d="M9.318 8.997c-.05.202-.084.403-.084.622V26.39c0 .218.025.42.084.621l9.246-9.247-9.246-8.768Z"
      fill="#4285F4"
    />
    <Path
      d="m18.33 18 4.627-4.628-10.053-5.828a2.427 2.427 0 0 0-3.586 1.444L18.329 18Z"
      fill="#34A853"
    />
    <Path
      fill="none"
      d="M8 .5h20A7.5 7.5 0 0 1 35.5 8v20a7.5 7.5 0 0 1-7.5 7.5H8A7.5 7.5 0 0 1 .5 28V8A7.5 7.5 0 0 1 8 .5Z"
      stroke="#fff"
      strokeOpacity="0.05"
    />
  </Svg>
);
export default SvgPlayStore;
