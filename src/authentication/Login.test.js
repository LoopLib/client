import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from './login';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // Adjust if AuthContext is elsewhere

test('renders login form without crashing', () => {
  render(
    <AuthProvider>
      <Router>
        <Login />
      </Router>
    </AuthProvider>
  );

  // Basic elements
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
