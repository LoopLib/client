import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayButton from './play-button';

test('renders play button and toggles on click', () => {
  const togglePlay = jest.fn();

  render(
    <PlayButton
      isPlaying={false}
      togglePlay={togglePlay}
      positionStyles={{}}
    />
  );

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(togglePlay).toHaveBeenCalled();
});
