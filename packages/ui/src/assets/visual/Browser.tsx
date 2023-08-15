import Svg, { Circle, Path, Rect, SvgProps } from 'react-native-svg';
const SvgBrowser = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 60 60" {...props}>
    <Rect width="60" height="60" fill="#1DC956" rx="30" />
    <Circle cx="30" cy="30" r="3" fill="#fff" />
    <Path
      fill="#2BEE6C"
      stroke="#fff"
      strokeWidth="2"
      d="m45.32 17.9-.88-.42.88.42.02-.05c.1-.2.21-.44.26-.7l-.82-.15.82.16a2 2 0 0 0-.24-1.4c-.13-.23-.32-.42-.47-.57a8.42 8.42 0 0 1-.04-.04l-.04-.04a2.9 2.9 0 0 0-.56-.47l-.51.86.5-.86a2 2 0 0 0-1.4-.24c-.26.05-.5.16-.69.26l-.05.02-15.05 7.25-.1.05c-1.14.55-1.85.89-2.46 1.37a7 7 0 0 0-1.13 1.14c-.5.6-.83 1.32-1.38 2.45l-.05.11-7.25 15.05-.02.05c-.1.2-.21.43-.26.69a2 2 0 0 0 .24 1.4l.85-.5-.85.5c.13.23.32.42.47.57l.04.04.04.04c.15.15.34.34.56.47a2 2 0 0 0 1.41.24l-.2-.98.2.98c.25-.05.5-.17.69-.26l.05-.02-.42-.87.42.87 15.05-7.25.1-.05c1.14-.55 1.85-.89 2.46-1.38a7 7 0 0 0 1.13-1.13 12.87 12.87 0 0 0 1.43-2.56l7.25-15.05Z"
    />
    <Path
      fill="#1DC956"
      d="M33.38 32.72 30.7 29.3 15.86 44.14l.2.2a1 1 0 0 0 1.14.2l15.1-7.27a3 3 0 0 0 1.08-4.55Z"
    />
    <Path
      fill="#86F999"
      d="m26.62 27.28 2.67 3.43 14.85-14.85-.2-.2a1 1 0 0 0-1.14-.2l-15.1 7.27a3 3 0 0 0-1.08 4.55Z"
    />
    <Circle cx="30" cy="30" r="3" fill="#fff" transform="rotate(45 30 30)" />
    <Rect width="59" height="59" x=".5" y=".5" stroke="#062B2B" strokeOpacity=".1" rx="29.5" />
  </Svg>
);
export default SvgBrowser;