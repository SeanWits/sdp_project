import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Register from './Register';
import { registerUser } from '../../utils/authFunctions';

jest.mock('../../utils/authFunctions');

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: Router });
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form', () => {
    renderWithRouter(<Register />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Surname')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Person Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByText('Have an account? Login')).toBeInTheDocument();
  });

  test('displays error for invalid email', async () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  test('displays error for mismatched passwords', async () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  test('displays error message on registration failure', async () => {
    registerUser.mockRejectedValue({ code: 'auth/email-already-in-use' });

    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Surname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Person Number'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('This email is already registered. Please use a different email or try logging in.')).toBeInTheDocument();
    });
  });
});