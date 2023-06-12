import { StyleProp, Text, TextStyle, TextProps } from 'react-native';
import useTheme from '../hooks/useTheme';

interface Props extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

function Web3Text({ children, style, ...props }: Props) {
  const Theme = useTheme();
  return (
    <Text style={[{ color: Theme.foreground1 }, style]} {...props}>
      {children}
    </Text>
  );
}

export default Web3Text;
