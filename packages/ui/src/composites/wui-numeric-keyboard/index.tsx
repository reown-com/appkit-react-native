import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../../components/wui-text';
import { FlexView } from '../../layout/wui-flex';
import { useTheme } from '../../hooks/useTheme';

export interface NumericKeyboardProps {
  onKeyPress: (value: string) => void;
}

export function NumericKeyboard({ onKeyPress }: NumericKeyboardProps) {
  const Theme = useTheme();
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [',', '0', 'erase']
  ];

  const handlePress = (key: string) => {
    onKeyPress(key);
  };

  return (
    <FlexView>
      {keys.map((row, rowIndex) => (
        <FlexView
          key={`row-${rowIndex}`}
          flexDirection="row"
          justifyContent="space-around"
          style={styles.row}
        >
          {row.map(key => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handlePress(key)}>
              {key === 'erase' ? (
                <Text style={[styles.keyText, { color: Theme['fg-100'] }]}>←</Text>
              ) : (
                <Text style={[styles.keyText, { color: Theme['fg-100'] }]}>{key}</Text>
              )}
            </TouchableOpacity>
          ))}
        </FlexView>
      ))}
    </FlexView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 10
  },
  key: {
    width: 70,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  keyText: {
    fontSize: 26
  }
});
