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

  beforeEach(() => {
    navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReservations),
      })
    );

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
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('fetches reservations on component mount', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations'),
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer mock-token' }
        })
      );
    });
  });

  test('displays loading state and then reservations', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Not Loading')).toBeInTheDocument();
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });
  });

  test('formats date correctly', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('October 15, 2024, 06:00 PM')).toBeInTheDocument();
    });
  });

  test('displays correct reservation status', async () => {
    const pastReservation = { ...mockReservations[0], date: '2024-09-15T18:00:00' };
    const upcomingReservation = { ...mockReservations[0], date: '2024-10-15T18:00:00' };
    const imminentReservation = { ...mockReservations[0], date: '2024-10-02T13:30:00' };

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([pastReservation, upcomingReservation, imminentReservation]),
      })
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Status: Attended')).toBeInTheDocument();
      expect(screen.getByText('Status: Upcoming')).toBeInTheDocument();
      expect(screen.getByText('Status: Imminent')).toBeInTheDocument();
    });
  });

  test('handles reservation cancellation for eligible reservations', async () => {
    const cancelableReservation = { ...mockReservations[0], date: '2024-10-15T18:00:00' };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([cancelableReservation]),
      })
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument();
    });

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    global.alert = jest.fn();

    fireEvent.click(screen.getByText('Cancel Reservation'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(global.alert).toHaveBeenCalledWith('Reservation cancelled successfully.');
    });
  });

  test('prevents cancellation of imminent reservations', async () => {
    const imminentReservation = { ...mockReservations[0], date: '2024-10-02T13:30:00' };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([imminentReservation]),
      })
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument();
    });

    global.alert = jest.fn();

    fireEvent.click(screen.getByText('Cancel Reservation'));

    expect(global.alert).toHaveBeenCalledWith('Reservations can only be cancelled more than 1 hour before the scheduled time.');
  });

  test('navigates back to menu', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Back to Menu'));
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });
});