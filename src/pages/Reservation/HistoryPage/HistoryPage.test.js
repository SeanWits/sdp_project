import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import HistoryPage from './HistoryPage';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../components/Header/Header', () => () => <div>Header</div>);
jest.mock('../../../components/Footer/Footer', () => () => <div>Footer</div>);
jest.mock('../../../components/LoadModal/LoadModal', () => ({ loading }) => (
  <div>{loading ? 'Loading...' : 'Not Loading'}</div>
));

const mockUser = {
  getIdToken: jest.fn(() => Promise.resolve('mock-token')),
};

const mockReservations = [
  {
    id: '1',
    restaurantName: 'Test Restaurant',
    date: '2024-10-15T18:00:00',
    numberOfPeople: 2,
  },
];

describe('HistoryPage', () => {
  let navigateMock;
  let mockOnClose;
  let mockOnReservationCancelled;

  beforeEach(() => {
    navigateMock = jest.fn();
    mockOnClose = jest.fn();
    mockOnReservationCancelled = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReservations),
      })
    );

    global.console.error = jest.fn();
    global.alert = jest.fn();

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-10-02T12:00:00'));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test('redirects to login page if user is not logged in', () => {
    render(
      <UserContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('handles API error when fetching reservations', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(alert).toHaveBeenCalledWith('Failed to fetch reservations. Please try again.');
    });
  });

  test('handles network error when fetching reservations', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(alert).toHaveBeenCalledWith('Failed to fetch reservations. Please try again.');
    });
  });

  test('handles API error when cancelling reservation', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReservations),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500
      }));

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Reservation'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(alert).toHaveBeenCalledWith('Failed to cancel reservation. Please try again.');
    });
  });

  test('handles network error when cancelling reservation', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReservations),
      }))
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Reservation'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(alert).toHaveBeenCalledWith('Failed to cancel reservation. Please try again.');
    });
  });

  test('successful reservation cancellation calls onReservationCancelled', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReservations),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true
      }));

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Reservation'));

    await waitFor(() => {
      expect(mockOnReservationCancelled).toHaveBeenCalled();
      expect(alert).toHaveBeenCalledWith('Reservation cancelled successfully.');
    });
  });

  test('handles case when date is not specified', async () => {
    const reservationWithoutDate = {
      ...mockReservations[0],
      date: null
    };

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([reservationWithoutDate]),
      })
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not specified')).toBeInTheDocument();
    });
  });

  test('handles back to menu click', async () => {
    const { getByText } = render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage onClose={mockOnClose} onReservationCancelled={mockOnReservationCancelled} />
        </MemoryRouter>
      </UserContext.Provider>
    );

    fireEvent.click(getByText('Back to Menu'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});