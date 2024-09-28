import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import OrderSummaryPage from './OrderSummaryPage';

// Mock the LoadModal component
jest.mock('../../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);

// Mock the react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

const mockReservation = {
  restaurantName: 'Test Restaurant',
  date: '2023-07-01T12:00:00Z',
  numberOfPeople: 4,
};

const renderWithContext = (ui, { user = mockUser } = {}) => {
  return render(
    <UserContext.Provider value={{ user }}>
      <Router>{ui}</Router>
    </UserContext.Provider>
  );
};

describe('OrderSummaryPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('reservationId', 'test-reservation-id');
  });

  test('renders OrderSummaryPage and fetches reservation data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReservation),
    });

    await act(async () => {
      renderWithContext(<OrderSummaryPage />);
    });

    expect(screen.getByText('Reservation Summary')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('July 1, 2023, 12:00 PM')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  test('redirects to login if user is not authenticated', async () => {
    await act(async () => {
      renderWithContext(<OrderSummaryPage />, { user: null });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redirects to home if reservationId is not in localStorage', async () => {
    localStorage.removeItem('reservationId');

    await act(async () => {
      renderWithContext(<OrderSummaryPage />);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    await act(async () => {
      renderWithContext(<OrderSummaryPage />);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching reservation: ', expect.any(Error));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles "Done" button click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReservation),
    });

    await act(async () => {
      renderWithContext(<OrderSummaryPage />);
    });

    const doneButton = screen.getByText('Done');
    fireEvent.click(doneButton);

    expect(localStorage.getItem('reservationId')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  test('displays "Not specified" for missing data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await act(async () => {
      renderWithContext(<OrderSummaryPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Not specified')).toHaveLength(3);
    });
  });

  test('formats date correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReservation),
    });

    await act(async () => {
      renderWithContext(<OrderSummaryPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('July 1, 2023, 12:00 PM')).toBeInTheDocument();
    });
  });
});