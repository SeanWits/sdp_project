import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Admin from './Admin';
import { getAuth } from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

const renderWithRouter = (ui, { route = '/admin' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(<Router>{ui}</Router>);
};

describe('Admin Component', () => {
  const mockUser = {
    getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue({ currentUser: mockUser });
  });

  test('renders Admin component', () => {
    renderWithRouter(<Admin />);
    expect(screen.getByRole('heading', { name: 'Generate API Key' })).toBeInTheDocument();
    expect(screen.getByLabelText('Team Name:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate API Key' })).toBeInTheDocument();
  });

  test('handles form submission and displays generated API key', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'mock-api-key' }),
    });

    renderWithRouter(<Admin />);

    fireEvent.change(screen.getByLabelText('Team Name:'), { target: { value: 'Test Team' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate API Key' }));

    await waitFor(() => {
      expect(screen.getByText('Generated API Key:')).toBeInTheDocument();
      expect(screen.getByText('mock-api-key')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/create-api-key`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-id-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName: 'Test Team' }),
      })
    );
  });

  test('displays error message when user is not logged in', async () => {
    getAuth.mockReturnValueOnce({ currentUser: null });

    renderWithRouter(<Admin />);

    fireEvent.change(screen.getByLabelText('Team Name:'), { target: { value: 'Test Team' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate API Key' }));

    await waitFor(() => {
      expect(screen.getByText('You must be logged in to generate an API key.')).toBeInTheDocument();
    });
  });

  test('displays error message when API call fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to generate API key'));

    renderWithRouter(<Admin />);

    fireEvent.change(screen.getByLabelText('Team Name:'), { target: { value: 'Test Team' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate API Key' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate API key')).toBeInTheDocument();
    });
  });

  test('clears previous error and generated key on new submission', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ apiKey: 'mock-api-key-1' }),
      })
      .mockRejectedValueOnce(new Error('API Error'));

    renderWithRouter(<Admin />);

    // First submission
    fireEvent.change(screen.getByLabelText('Team Name:'), { target: { value: 'Team 1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate API Key' }));

    await waitFor(() => {
      expect(screen.getByText('mock-api-key-1')).toBeInTheDocument();
    });

    // Second submission
    fireEvent.change(screen.getByLabelText('Team Name:'), { target: { value: 'Team 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate API Key' }));

    await waitFor(() => {
      expect(screen.queryByText('mock-api-key-1')).not.toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});