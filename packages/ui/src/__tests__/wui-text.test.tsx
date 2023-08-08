import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '../components/wui-text';

test('Text render', () => {
  const label = 'Hello World';
  const { getAllByText } = render(<Text>{label}</Text>);
  expect(getAllByText(label)).toBeTruthy();
});
