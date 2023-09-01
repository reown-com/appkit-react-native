import Svg, { G, Circle, Path, Defs, ClipPath, type SvgProps } from 'react-native-svg';
const SvgGoogle = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#Google_svg__a)">
      <G clipPath="url(#Google_svg__b)">
        <Circle cx={20} cy={20} r={20} fill="#fff" fillOpacity={0.05} />
        <Circle cx={20} cy={20} r={19.5} stroke="#fff" strokeOpacity={0.05} />
        <G clipPath="url(#Google_svg__c)">
          <Path
            fill="#4285F4"
            d="M20 17.704v4.647h6.458c-.283 1.495-1.134 2.76-2.41 3.611l3.894 3.022c2.269-2.094 3.578-5.17 3.578-8.825 0-.851-.076-1.67-.218-2.455H20Z"
          />
          <Path
            fill="#34A853"
            d="m13.275 22.17-.879.672-3.109 2.422C11.262 29.18 15.31 31.886 20 31.886c3.24 0 5.956-1.07 7.942-2.902l-3.895-3.022c-1.07.72-2.433 1.157-4.047 1.157-3.12 0-5.771-2.106-6.72-4.942l-.005-.007Z"
          />
          <Path
            fill="#FBBC05"
            d="M9.287 14.508A11.852 11.852 0 0 0 8 19.886c0 1.942.47 3.763 1.287 5.378 0 .01 3.993-3.098 3.993-3.098a7.19 7.19 0 0 1-.382-2.28c0-.797.142-1.56.382-2.28l-3.993-3.098Z"
          />
          <Path
            fill="#EA4335"
            d="M20 12.664c1.767 0 3.338.61 4.593 1.789l3.436-3.436C25.945 9.075 23.24 7.886 20 7.886c-4.69 0-8.738 2.694-10.713 6.622l3.993 3.098c.949-2.837 3.6-4.942 6.72-4.942Z"
          />
        </G>
      </G>
    </G>
    <Defs>
      <ClipPath id="Google_svg__a">
        <Path
          fill="#fff"
          d="M0 20C0 8.954 8.954 0 20 0s20 8.954 20 20-8.954 20-20 20S0 31.046 0 20Z"
        />
      </ClipPath>
      <ClipPath id="Google_svg__b">
        <Path fill="#fff" d="M0 0h40v40H0z" />
      </ClipPath>
      <ClipPath id="Google_svg__c">
        <Path fill="#fff" d="M8 7.886h24v24H8z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgGoogle;
