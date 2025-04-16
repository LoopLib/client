import React from 'react';
import { render } from '@testing-library/react';
import Statistics from './statistics';

test('renders Statistics component without crashing', () => {
  render(<Statistics audioFiles={[]} audioFilesCount={0} />);
});
