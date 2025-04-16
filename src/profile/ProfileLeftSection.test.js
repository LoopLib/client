import React from 'react';
import { render } from '@testing-library/react';
import ProfileLeftSection from './profile-left';

test('renders ProfileLeftSection without crashing', () => {
  render(
    <ProfileLeftSection
      profilePictureUrl=""
      selectedImage={null}
      uploading={false}
      handleImageChange={() => {}}
      handleProfilePictureUpload={() => {}}
    />
  );
});
