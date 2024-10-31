import { render } from '@testing-library/react-native';
import { configureInternal } from '@testing-library/react-native/build/config';
import { Text } from '../components/wui-text';

configureInternal({
  hostComponentNames: {
    text: 'RCTText',
    textInput: 'RCTTextInput',
    switch: 'RCTSwitch'
  }
});

test('Text render', () => {
  const label = 'Hello World';
  const { getAllByText } = render(<Text>{label}</Text>);
  expect(getAllByText(label)).toBeTruthy();
});
