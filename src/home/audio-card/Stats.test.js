import React from 'react';
import { render, screen } from '@testing-library/react';
import Stats from './stats';

test('renders Stats component with likes and downloads', () => {
  render(<Stats likes={10} downloads={5} />);
  expect(screen.getByText('10')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
});
