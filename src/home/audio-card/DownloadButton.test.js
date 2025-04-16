import React from 'react';
import { render, screen } from '@testing-library/react';
import DownloadButton from './download-button';

test('renders DownloadButton without crashing', () => {
  render(
    <DownloadButton
      fileUrl="https://example.com/audio.mp3"
      statsKey="some/stats.json"
      s3={{ upload: () => ({ promise: () => Promise.resolve() }) }} // dummy s3 object to avoid crashing
      downloads={0}
      setDownloads={() => {}}
    />
  );

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
});
