import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import HistoryPage from './HistoryPage';

// Mocks
jest.mock('../../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

global.fetch = jest.fn();
global.alert = jest.fn();

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

const renderWithContext = (ui, { user = mockUser } = {}) => {
  return render(
    <UserContext.Provider value={{ user }}>
      <Router>{ui}</Router>
    </UserContext.Provider>
  );
};

describe('HistoryPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2023-07-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('redirects to login if user is not authenticated', async () => {
    renderWithContext(<HistoryPage />, { user: null });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('fetches reservations on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/reservations`,
      expect.any(Object)
    );
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching reservations: ', expect.any(Error));
    expect(global.alert).toHaveBeenCalledWith('Failed to fetch reservations. Please try again.');
  });

  test('handles reservation cancellation', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Restaurant A', date: '2023-07-02T12:00:00Z', numberOfPeople: 2 },
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReservations),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Cancelled' }),
      });

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    const cancelButton = screen.getByText('Cancel Reservation');
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/reservations/1`,
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(global.alert).toHaveBeenCalledWith('Reservation cancelled successfully.');
  });

  test('prevents cancellation of imminent reservations', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Restaurant A', date: '2023-07-01T12:30:00Z', numberOfPeople: 2 },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReservations),
    });

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    const cancelButton = screen.getByText('Cancel Reservation');
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(global.alert).toHaveBeenCalledWith('Reservations can only be cancelled more than 1 hour before the scheduled time.');
  });

  test('displays correct reservation status', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Restaurant A', date: '2023-06-30T12:00:00Z', numberOfPeople: 2 },
      { id: '2', restaurantName: 'Restaurant B', date: '2023-07-01T13:30:00Z', numberOfPeople: 2 },
      { id: '3', restaurantName: 'Restaurant C', date: '2023-07-02T12:00:00Z', numberOfPeople: 2 },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReservations),
    });

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    expect(screen.getByText('Status: Attended')).toBeInTheDocument();
    expect(screen.getByText('Status: Imminent')).toBeInTheDocument();
    expect(screen.getByText('Status: Upcoming')).toBeInTheDocument();
  });

  test('formats date correctly', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Restaurant A', date: '2023-07-01T12:00:00Z', numberOfPeople: 2 },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReservations),
    });

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    expect(screen.getByText('Date: July 1, 2023, 12:00 PM')).toBeInTheDocument();
  });

  test('handles undefined date', async () => {
    const mockReservations = [
      { id: '1', restaurantName: 'Restaurant A', date: undefined, numberOfPeople: 2 },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReservations),
    });

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    expect(screen.getByText('Date: Not specified')).toBeInTheDocument();
  });

  test('navigates back to menu', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await act(async () => {
      renderWithContext(<HistoryPage />);
    });

    const backButton = screen.getByText('Back to Menu');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});