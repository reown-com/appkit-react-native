import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgExtension = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M6.712 2.986a.572.572 0 0 0-.572.572 1 1 0 0 1-1 1c-.581 0-.957.003-1.24.03-.27.027-.37.07-.417.097a.965.965 0 0 0-.36.36c-.042.072-.091.21-.113.667a2.572 2.572 0 0 1 0 5.124c.022.457.071.595.113.667.085.15.21.275.36.36.072.042.21.091.667.113a2.572 2.572 0 0 1 5.124 0c.457-.022.595-.071.667-.113a.966.966 0 0 0 .36-.36c.028-.048.07-.146.096-.416.028-.284.03-.66.031-1.241a1 1 0 0 1 1-1 .572.572 0 0 0 0-1.144 1 1 0 0 1-1-1c0-.581-.003-.957-.03-1.24-.027-.27-.07-.369-.097-.417a.965.965 0 0 0-.36-.36c-.048-.028-.147-.07-.417-.096-.283-.028-.659-.03-1.24-.031a1 1 0 0 1-1-1 .572.572 0 0 0-.572-.572ZM5.152 13.98a1 1 0 0 0 .988-1v-.776a.572.572 0 0 1 1.144 0v.776a1 1 0 0 0 .984 1h.025l.068.002.22.002c.165.002.378.003.513 0 .644-.015 1.276-.062 1.838-.383a2.965 2.965 0 0 0 1.107-1.107c.222-.39.309-.8.349-1.213a8.78 8.78 0 0 0 .034-.634 2.573 2.573 0 0 0 0-4.746 8.78 8.78 0 0 0-.034-.633c-.04-.414-.127-.825-.35-1.214a2.965 2.965 0 0 0-1.106-1.107c-.39-.222-.8-.308-1.214-.349a8.706 8.706 0 0 0-.633-.034 2.573 2.573 0 0 0-4.746 0c-.23.005-.44.015-.634.034-.413.04-.824.127-1.213.35a2.965 2.965 0 0 0-1.107 1.106c-.32.562-.368 1.194-.383 1.838a21.39 21.39 0 0 0 0 .721l.002.097A1 1 0 0 0 2 7.7l.299.001.483.001a.572.572 0 0 1 0 1.144h-.47l-.305-.002a1 1 0 0 0-1.003.989l-.001.095a63.866 63.866 0 0 0 0 .728c.014.644.061 1.276.382 1.838.263.462.645.844 1.107 1.107.562.32 1.194.368 1.838.383a20.926 20.926 0 0 0 .723-.002l.1-.002Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgExtension;