import Svg, { ClipPath, Defs, G, Path, Rect, type SvgProps } from 'react-native-svg';
const SvgDefiAlt = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 60 60" {...props}>
    <G clipPath="url(#a)">
      <Rect width="60" height="60" fill="#C653C6" rx="30" />
      <Path
        fill="#E87DE8"
        d="M57.98.01v19.5a4.09 4.09 0 0 0-2.63 2.29L50.7 34.2a2 2 0 0 1-2.5 1.2l-2.53-.84a2 2 0 0 0-2.42 1l-2.97 5.94a2 2 0 0 1-3.7-.32L32.8 28.6a2 2 0 0 0-3.02-1.09l-3.35 2.23a2 2 0 0 0-.64.7l-5.3 9.72a2 2 0 0 1-1.43 1.01l-4.13.69a2 2 0 0 1-1.61-.44l-3.9-3.24a2 2 0 0 0-2.69.12L2.1 42.93.02 43V.01h57.96Z"
      />
      <Path
        fill="#fff"
        d="m61.95 16.94.05 2.1-3.85 1.28a3 3 0 0 0-1.86 1.79l-4.65 12.4a3 3 0 0 1-3.76 1.8l-2.53-.84a1 1 0 0 0-1.2.5l-2.98 5.94a3 3 0 0 1-5.55-.48l-3.78-12.58a1 1 0 0 0-1.5-.55l-3.35 2.23a1 1 0 0 0-.32.35l-5.3 9.72a3 3 0 0 1-2.14 1.52l-4.14.69a3 3 0 0 1-2.41-.66l-3.9-3.24a1 1 0 0 0-1.34.06l-5.28 5.28c-.05-.84-.08-1.75-.1-2.73l3.97-3.96a3 3 0 0 1 4.04-.19l3.89 3.25a1 1 0 0 0 .8.21l4.14-.68a1 1 0 0 0 .71-.51l5.3-9.71a3 3 0 0 1 .97-1.06l3.34-2.23a3 3 0 0 1 4.54 1.63l3.77 12.58a1 1 0 0 0 1.86.16l2.96-5.93a3 3 0 0 1 3.64-1.5l2.52.83a1 1 0 0 0 1.25-.6l4.66-12.4a5 5 0 0 1 3.1-2.99l4.43-1.48Z"
      />
      <Path
        fill="#fff"
        fillRule="evenodd"
        d="M35.5 27a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"
        clipRule="evenodd"
      />
      <Path fill="#fff" d="M31 0v60h-2V0h2Z" />
      <Path fill="#E87DE8" d="M33.5 27a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
    </G>
    <Rect width="59" height="59" x=".5" y=".5" stroke="#fff" strokeOpacity=".1" rx="29.5" />
    <Defs>
      <ClipPath id="a">
        <Rect width="60" height="60" fill="#fff" rx="30" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgDefiAlt;
