import React from 'react';
import { render, screen } from '@testing-library/react';
import Library from './library';
import '@testing-library/jest-dom';

// ✅ Proper mocks
jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => ({
    listObjectsV2: () => ({
      promise: () => Promise.resolve({ Contents: [] }),
    }),
    getObject: () => ({
      promise: () => Promise.resolve({ Body: Buffer.from('{}') }),
    }),
    getSignedUrl: () => 'https://fakeurl.com/stats.json',
    config: { region: 'us-east-1' },
  })),
}));

jest.mock('axios', () => ({
  get: () => Promise.resolve({ data: { likes: 0, downloads: 0 } }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../audio-card/audio-card', () => () => <div>AudioCard</div>);
jest.mock('../searchbar/searchbar', () => () => <div>SearchBar</div>);
jest.mock('../../loading/loading', () => () => <div>LoadingPage</div>);

describe('Library component', () => {
  it('renders no audio files message after loading', async () => {
    render(<Library />);
    const noFilesMessage = await screen.findByText(/no audio files found/i);
    expect(noFilesMessage).toBeInTheDocument();
  });
});
