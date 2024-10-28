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

process.env.REACT_APP_API_URL = 'https://app-rjelmm56pa-uc.a.run.app/';

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

  test('displays loading state initially', () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays reservation data after loading', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <OrderSummaryPage />
        </MemoryRouter>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not Loading')).toBeInTheDocument();
    });

    expect(screen.getByText(/Test Restaurant/)).toBeInTheDocument();
    expect(screen.getByText(/October 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText('Number of People:')).toBeInTheDocument();
    expect(screen.getByText(/^2$/)).toBeInTheDocument();
  });

  test('handles API error correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
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
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('formats date correctly', async () => {
    const mockDataWithDifferentDate = {
      ...mockReservationData,
      date: '2024-12-25T20:30:00',
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDataWithDifferentDate),
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
      expect(screen.getByText(/December 25, 2024.*8:30 PM/)).toBeInTheDocument();
    });
  });

  test('handles missing reservation data gracefully', async () => {
    const mockEmptyData = {
      restaurantName: null,
      date: null,
      numberOfPeople: null,
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmptyData),
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
      expect(screen.getByText('Not Loading')).toBeInTheDocument();
    });

    // Check that all fields show "Not specified"
    expect(screen.getAllByText('Not specified')).toHaveLength(3);
    
    // Verify each specific field shows "Not specified"
    const restaurantElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' && 
             element.textContent === 'Restaurant: Not specified';
    });
    expect(restaurantElement).toBeInTheDocument();

    const dateElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' && 
             element.textContent === 'Date: Not specified';
    });
    expect(dateElement).toBeInTheDocument();

    const peopleElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' && 
             element.textContent === 'Number of People: Not specified';
    });
    expect(peopleElement).toBeInTheDocument();
  });

});