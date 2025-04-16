import React from 'react';
import { render, screen } from '@testing-library/react';
import AvatarComponent from './avatar';

test('renders AvatarComponent with default props', () => {
  render(<AvatarComponent publisherName="Test User" profilePicture="" />);

  const avatar = screen.getByRole('img', { name: /test user/i });
  expect(avatar).toBeInTheDocument();
});
