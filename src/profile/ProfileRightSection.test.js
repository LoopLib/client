import React from 'react';
import { render } from '@testing-library/react';
import ProfileRightSection from './profile-right';

test('renders ProfileRightSection without crashing', () => {
  render(
    <ProfileRightSection
      user={{ uid: 'test-user' }}
      editMode={false}
      setEditMode={() => {}}
      profileData={{ name: '', secondName: '', email: '', username: '' }}
      handleInputChange={() => {}}
      saveProfileData={() => {}}
      showPasswordFields={false}
      setShowPasswordFields={() => {}}
      newPassword=""
      setNewPassword={() => {}}
      confirmNewPassword=""
      setConfirmNewPassword={() => {}}
      handlePasswordUpdate={() => {}}
    />
  );
});
