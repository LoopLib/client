import React from 'react';
import { render, screen } from '@testing-library/react';
import Register from './Register';
import { BrowserRouter as Router } from 'react-router-dom';

test('renders Register form with basic fields', () => {
  render(
    <Router>
      <Register />
    </Router>
  );

  // Checks for the form title
  expect(screen.getByText(/register/i)).toBeInTheDocument();

  // Checks for input fields
  expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/second name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

  // Checks for the register button
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});
