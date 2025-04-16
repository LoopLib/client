import React from 'react';
import { render, screen } from '@testing-library/react';
import Metadata from './metadata-card';

test('renders metadata values', () => {
  render(
    <Metadata
      duration="2:45"
      musicalKey="Cmin"
      bpm="120"
      genre="Hip-Hop"
      instrument="Drums"
    />
  );

  expect(screen.getByText('2:45')).toBeInTheDocument();
  expect(screen.getByText('C min')).toBeInTheDocument(); // from formatMusicalKey
  expect(screen.getByText('120 BPM')).toBeInTheDocument();
  expect(screen.getByText('Hip-Hop')).toBeInTheDocument();
  expect(screen.getByText('Drums')).toBeInTheDocument();
});
