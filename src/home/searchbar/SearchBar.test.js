import React from 'react';
import { render } from '@testing-library/react';
import SearchBar from './searchbar';

test('renders SearchBar without crashing', () => {
  render(
    <SearchBar
      onSearchChange={() => {}}
      instrumentOptions={[]}
      genreOptions={[]}
    />
  );
});
