import React from 'react';
import { render } from '@testing-library/react';
import LoadingPage from './loading';

test('renders LoadingPage without crashing', () => {
  render(<LoadingPage />);
});
