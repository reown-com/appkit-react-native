import Svg, { ClipPath, Defs, G, Path, Rect, type SvgProps } from 'react-native-svg';
const SvgEth = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 60 60" {...props}>
    <G clipPath="url(#a)">
      <Rect width="60" height="60" fill="#987DE8" rx="30" />
      <Path
        fill="#fff"
        fillRule="evenodd"
        d="m15.48 28.37 11.97-19.3a3 3 0 0 1 5.1 0l11.97 19.3a6 6 0 0 1 .9 3.14v.03a6 6 0 0 1-1.16 3.56L33.23 50.2a4 4 0 0 1-6.46 0L15.73 35.1a6 6 0 0 1-1.15-3.54v-.03a6 6 0 0 1 .9-3.16Z"
        clipRule="evenodd"
      />
      <Path
        fill="#643CDD"
        d="M30.84 10.11a1 1 0 0 0-.84-.46V24.5l12.6 5.53a2 2 0 0 0-.28-1.4L30.84 10.11Z"
      />
      <Path
        fill="#BDADEB"
        d="M30 9.65a1 1 0 0 0-.85.46L17.66 28.64a2 2 0 0 0-.26 1.39L30 24.5V9.65Z"
      />
      <Path
        fill="#643CDD"
        d="M30 50.54a1 1 0 0 0 .8-.4l11.24-15.38c.3-.44-.2-1-.66-.73l-9.89 5.68a3 3 0 0 1-1.5.4v10.43Z"
      />
      <Path
        fill="#BDADEB"
        d="m17.97 34.76 11.22 15.37c.2.28.5.41.8.41V40.11a3 3 0 0 1-1.49-.4l-9.88-5.68c-.47-.27-.97.3-.65.73Z"
      />
      <Path
        fill="#401AB3"
        d="M42.6 30.03 30 24.5v13.14a3 3 0 0 0 1.5-.4l10.14-5.83a2 2 0 0 0 .95-1.38Z"
      />
      <Path
        fill="#7C5AE2"
        d="M30 37.64V24.46l-12.6 5.57a2 2 0 0 0 .97 1.39l10.13 5.82a3 3 0 0 0 1.5.4Z"
      />
    </G>
    <Rect width="59" height="59" x=".5" y=".5" stroke="#fff" strokeOpacity=".1" rx="29.5" />
    <Defs>
      <ClipPath id="a">
        <Rect width="60" height="60" fill="#fff" rx="30" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgEth;
