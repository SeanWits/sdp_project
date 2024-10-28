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

  test('renders register form with all required elements', () => {
    renderWithRouter(<Register />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Surname')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Person Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByText('Have an account? Login')).toBeInTheDocument();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  test('updates form fields on user input', () => {
    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Surname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Person Number'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });

    expect(screen.getByPlaceholderText('Name')).toHaveValue('John');
    expect(screen.getByPlaceholderText('Surname')).toHaveValue('Doe');
    expect(screen.getByPlaceholderText('Person Number')).toHaveValue('12345');
    expect(screen.getByPlaceholderText('Email')).toHaveValue('john@example.com');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('password123');
    expect(screen.getByPlaceholderText('Confirm Password')).toHaveValue('password123');
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
    
    // Fill in all required fields with valid data
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Surname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Person Number'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } }); // Add valid email
    
    // Set mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password456' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
});

  test('calls registerUser with correct data on successful form submission', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    registerUser.mockResolvedValue();

    renderWithRouter(<Register />);
    
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Surname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Person Number'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('John', 'Doe', 'john@example.com', '12345', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays error message for email already in use', async () => {
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