import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import ReservationPage from './ReservationPage';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the UserContext
const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '123' }),
  useLocation: () => ({ state: { restaurant: { name: 'Test Restaurant', opening_time: '09:00', closing_time: '22:00' } } }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock alert
global.alert = jest.fn();

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

describe('ReservationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reservation form', () => {
    renderWithRouter(<ReservationPage />);
    expect(screen.getByText('Reservation for Test Restaurant')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Time Slot:')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of People:')).toBeInTheDocument();
    expect(screen.getByText('Confirm Reservation')).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reservationId: '456' }),
    });

    renderWithRouter(<ReservationPage />);

    fireEvent.change(screen.getByLabelText('Select Date:'), { target: { value: '2023-09-30' } });
    fireEvent.change(screen.getByLabelText('Select Time Slot:'), { target: { value: '12:00' } });
    fireEvent.change(screen.getByLabelText('Number of People:'), { target: { value: '2' } });

    fireEvent.click(screen.getByText('Confirm Reservation'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/reservations`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            restaurantId: '123',
            restaurantName: 'Test Restaurant',
            date: '2023-09-30T12:00',
            numberOfPeople: 2,
          }),
        })
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('reservationId', '456');
      expect(mockNavigate).toHaveBeenCalledWith('/order-summary');
    });
  });

  test('handles form submission error', async () => {
    fetch.mockRejectedValueOnce(new Error('API error'));

    renderWithRouter(<ReservationPage />);

    fireEvent.change(screen.getByLabelText('Select Date:'), { target: { value: '2023-09-30' } });
    fireEvent.change(screen.getByLabelText('Select Time Slot:'), { target: { value: '12:00' } });
    fireEvent.change(screen.getByLabelText('Number of People:'), { target: { value: '2' } });

    fireEvent.click(screen.getByText('Confirm Reservation'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to create reservation. Please try again.');
    });
  });

  test('checks for active reservations on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hasActiveReservation: true }),
    });

    renderWithRouter(<ReservationPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/reservations/active`,
        expect.objectContaining({ headers: { 'Authorization': 'Bearer mock-token' } })
      );
      expect(global.alert).toHaveBeenCalledWith('You have an active reservation');
      expect(mockNavigate).toHaveBeenCalledWith('/history');
    });
  });

  test('handles error when checking for active reservations', async () => {
    fetch.mockRejectedValueOnce(new Error('API error'));

    renderWithRouter(<ReservationPage />);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to check active reservations. Please try again.');
    });
  });
});