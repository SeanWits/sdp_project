import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import HistoryPage from './HistoryPage';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the UserContext
const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ user: mockUser }}>
        {ui}
      </UserContext.Provider>
    </BrowserRouter>
  );
};

describe('HistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for lines 15-16: Redirect to login if no user is authenticated
  test('redirects to login if user is not authenticated', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: null }}>
          <HistoryPage />
        </UserContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // Test for lines 32, 46-72: Fetch failure and non-OK response
  test('handles fetch non-OK response and displays an error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false, // Simulate non-OK response
      json: async () => ({}),
    });

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to fetch reservations. Please try again.');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching reservations: ', expect.any(Error));
    });

    alertMock.mockRestore();
    consoleSpy.mockRestore();
  });

  test('renders loading state initially', () => {
    renderWithRouter(<HistoryPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // Test for lines 118-128: Cancellation rejection due to time constraint
  test('prevents reservation cancellation if less than 1 hour remains', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Test Restaurant', date: new Date(Date.now() + 3000).toISOString(), numberOfPeople: 2 }, // 3 seconds from now
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations,
    });

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Reservation'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Reservations can only be cancelled more than 1 hour before the scheduled time.');
    });

    alertMock.mockRestore();
  });

  // Test for successful reservation fetch and display
  test('fetches and displays reservations', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Test Restaurant', date: '2023-09-30T12:00:00', numberOfPeople: 2 },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations,
    });

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('September 30, 2023, 12:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Number of People: 2')).toBeInTheDocument();
    });
  });

  // Test for successful reservation cancellation
  test('handles reservation cancellation', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Test Restaurant', date: new Date(Date.now() + 86400000).toISOString(), numberOfPeople: 2 }, // 1 day from now
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
    });

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Reservation'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenLastCalledWith(
        `${process.env.REACT_APP_API_URL}/reservations/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  // Test for fetch failure and error handling
  test('handles fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('API error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithRouter(<HistoryPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching reservations: ', expect.any(Error));
      expect(alertMock).toHaveBeenCalledWith('Failed to fetch reservations. Please try again.');
    });

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });
});
