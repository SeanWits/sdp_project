import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login';
import { loginUser } from '../../utils/authFunctions';

jest.mock('../../utils/authFunctions');

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: Router });
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account? Register")).toBeInTheDocument();
  });

  test('submits form with email and password', async () => {
    renderWithRouter(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('navigates to register page when clicking on register link', () => {
    renderWithRouter(<Login />);
    
    const registerLink = screen.getByText("Don't have an account? Register");
    expect(registerLink.getAttribute('href')).toBe('/register');
  });
});