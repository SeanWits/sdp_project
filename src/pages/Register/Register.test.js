import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Register from './Register';
import { registerUser } from '../../utils/authFunctions';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../utils/authFunctions');

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: Router });
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays error for invalid email', async () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });


  test('displays error message for invalid email format from server', async () => {
    registerUser.mockRejectedValue({ code: 'auth/invalid-email' });

    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('The email address is badly formatted. Please enter a valid email.')).toBeInTheDocument();
    });
  });

  test('displays generic error message for unknown errors', async () => {
    registerUser.mockRejectedValue({ code: 'unknown-error' });

    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('An error occurred during registration. Please try again.')).toBeInTheDocument();
    });
  });

  test('navigates to login page when "Have an account? Login" is clicked', () => {
    renderWithRouter(<Register />);
    const loginLink = screen.getByText('Have an account? Login');
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});