import Svg, { ClipPath, Defs, G, Path, Rect, SvgProps } from 'react-native-svg';
const SvgNft = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 60 60" {...props}>
    <G clipPath="url(#a)">
      <Rect width="60" height="60" fill="#C653C6" rx="3" />
      <Path
        fill="#E87DE8"
        stroke="#fff"
        strokeWidth="2"
        d="M52.1 47.34c0-4.24-1.44-9.55-5.9-12.4a2.86 2.86 0 0 0-1.6-3.89v-.82c0-1.19-.52-2.26-1.35-3a4.74 4.74 0 0 0-2.4-6.26v-5.5a11.31 11.31 0 1 0-22.63 0v2.15a3.34 3.34 0 0 0-1.18 5.05 4.74 4.74 0 0 0-.68 6.44A5.22 5.22 0 0 0 14 35.92c-3.06 4.13-6.1 8.3-6.1 15.64 0 2.67.37 4.86.74 6.39a20.3 20.3 0 0 0 .73 2.39l.02.04v.01l.92-.39-.92.4.26.6h38.26l.3-.49-.87-.51.86.5.02-.01.03-.07a16.32 16.32 0 0 0 .57-1.05c.36-.72.85-1.74 1.33-2.96a25.51 25.51 0 0 0 1.94-9.07Z"
      />
      <Path
        fill="#fff"
        fillRule="evenodd"
        d="M26.5 29.5c-3-.5-5.5-3-5.5-7v-7c0-.47 0-.7.03-.9a3 3 0 0 1 2.58-2.57c.2-.03.42-.03.89-.03 2 0 2.5-2.5 2.5-2.5s0 2.5 2.5 2.5c1.4 0 2.1 0 2.65.23a3 3 0 0 1 1.62 1.62c.23.55.23 1.25.23 2.65v6c0 4-3 7-6.5 7 1.35.23 4 0 6.5-2v9.53C34 38.5 31.5 40 28 40s-6-1.5-6-2.97L24 34l2.5 1.5v-6ZM26 47h4.5c2.5 0 3 4 3 5.5h-3l-1-1.5H26v-4Zm-6.25 5.5H24V57h-8c0-1 1-4.5 3.75-4.5Z"
        clipRule="evenodd"
      />
    </G>
    <Rect width="59" height="59" x=".5" y=".5" stroke="#fff" strokeOpacity=".1" rx="2.5" />
    <Defs>
      <ClipPath id="a">
        <Rect width="60" height="60" fill="#fff" rx="3" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgNft;
