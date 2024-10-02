import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import OrderSummaryPage from './OrderSummaryPage';

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

const mockReservationData = {
  restaurantName: 'Test Restaurant',
  date: '2024-10-15T18:00:00',
  numberOfPeople: 2,
};

describe('OrderSummaryPage', () => {
  let navigateMock;

  beforeEach(() => {
    navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReservationData),
      })
    );

    localStorage.setItem('reservationId', '123');

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-10-02T12:00:00'));
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    jest.useRealTimers();
  });

  test('redirects to login page if user is not logged in', () => {
    render(
      <UserContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('redirects to home page if reservationId is not in localStorage', () => {
    localStorage.removeItem('reservationId');
    
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('fetches reservation data on component mount', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/123'),
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer mock-token' }
        })
      );
    });
  });

  test('displays loading state and then reservation summary', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Not Loading')).toBeInTheDocument();
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('October 15, 2024, 06:00 PM')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching reservation: ', expect.any(Error));
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('handles "Done" button click', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Done'));
    });

    expect(localStorage.getItem('reservationId')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/history');
  });

  test('formats date correctly', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('October 15, 2024, 06:00 PM')).toBeInTheDocument();
    });
  });

  test('displays "Not specified" for missing data', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not specified')).toBeInTheDocument();
    });
  });
});