import Svg, { G, Circle, Path, Defs, ClipPath, type SvgProps } from 'react-native-svg';
const SvgFacebook = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#Facebook_svg__a)">
      <G clipPath="url(#Facebook_svg__b)">
        <Circle cx={20} cy={19.886} r={20} fill="#1877F2" />
        <Circle cx={20} cy={19.886} r={19.5} stroke="#fff" strokeOpacity={0.1} />
        <G clipPath="url(#Facebook_svg__c)">
          <Path
            fill="#fff"
            d="M26 12.385h-2.886c-.922 0-1.614.378-1.614 1.333v1.667H26l-.357 4.5H21.5v12H17v-12h-3v-4.5h3V12.5c0-3.033 1.596-4.615 5.192-4.615H26v4.5Z"
          />
        </G>
      </G>
      <Path
        fill="#1877F2"
        d="M40 20C40 8.954 31.046 0 20 0S0 8.954 0 20c0 9.983 7.314 18.257 16.875 19.757V25.781h-5.078V20h5.078v-4.406c0-5.013 2.986-7.781 7.554-7.781 2.189 0 4.477.39 4.477.39v4.922h-2.522c-2.484 0-3.259 1.542-3.259 3.123V20h5.547l-.887 5.781h-4.66v13.976C32.686 38.257 40 29.983 40 20Z"
      />
      <Path
        fill="#fff"
        d="M27.785 25.781 28.672 20h-5.547v-3.752c0-1.581.775-3.123 3.26-3.123h2.521V8.203s-2.288-.39-4.477-.39c-4.568 0-7.554 2.768-7.554 7.78V20h-5.078v5.781h5.078v13.976a20.148 20.148 0 0 0 6.25 0V25.781h4.66Z"
      />
    </G>
    <Defs>
      <ClipPath id="Facebook_svg__a">
        <Path
          fill="#fff"
          d="M0 20C0 8.954 8.954 0 20 0s20 8.954 20 20-8.954 20-20 20S0 31.046 0 20Z"
        />
      </ClipPath>
      <ClipPath id="Facebook_svg__b">
        <Path fill="#fff" d="M0 0h40v40H0z" />
      </ClipPath>
      <ClipPath id="Facebook_svg__c">
        <Path fill="#fff" d="M8 7.886h24v24H8z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgFacebook;
