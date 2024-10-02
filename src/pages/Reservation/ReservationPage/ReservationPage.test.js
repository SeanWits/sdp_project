import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserContext } from '../../../utils/userContext';
import ReservationPage from './ReservationPage';

const mockUser = {
  getIdToken: jest.fn(() => Promise.resolve('mock-token')),
};

const mockRestaurant = {
  id: '1',
  name: 'Test Restaurant',
  opening_time: '10:00',
  closing_time: '22:00',
};

describe('ReservationPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hasActiveReservation: false }),
      })
    );
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-10-02T12:00:00'));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  // ... (previous tests remain the same)

  test('sets minimum date for date input', () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <ReservationPage restaurant={mockRestaurant} onClose={() => {}} />
      </UserContext.Provider>
    );

    const dateInput = screen.getByLabelText('Select Date:');
    expect(dateInput).toHaveAttribute('min', '2024-10-02');
  });

  test('generates correct time slots', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <ReservationPage restaurant={mockRestaurant} onClose={() => {}} />
      </UserContext.Provider>
    );

    const dateInput = screen.getByLabelText('Select Date:');
    fireEvent.change(dateInput, { target: { value: '2024-10-03' } });

    await waitFor(() => {
      const timeSlotSelect = screen.getByLabelText('Select Time Slot:');
      expect(timeSlotSelect).toBeEnabled();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('21:30')).toBeInTheDocument();
      expect(screen.queryByText('22:00')).not.toBeInTheDocument();
    });
  });

  test('disables past time slots for today', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <ReservationPage restaurant={mockRestaurant} onClose={() => {}} />
      </UserContext.Provider>
    );

    const dateInput = screen.getByLabelText('Select Date:');
    fireEvent.change(dateInput, { target: { value: '2024-10-02' } });

    await waitFor(() => {
      const timeSlotSelect = screen.getByLabelText('Select Time Slot:');
      expect(timeSlotSelect).toBeEnabled();
      expect(screen.queryByText('10:00')).not.toBeInTheDocument();
      expect(screen.queryByText('11:30')).not.toBeInTheDocument();
      expect(screen.getByText('12:30')).toBeInTheDocument();
    });
  });

  test('handles reservation confirmation with all fields filled', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    const onCloseMock = jest.fn();

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <ReservationPage restaurant={mockRestaurant} onClose={onCloseMock} />
      </UserContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Select Date:'), { target: { value: '2024-10-15' } });
    fireEvent.change(screen.getByLabelText('Select Time Slot:'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('Number of People:'), { target: { value: '2' } });

    const confirmButton = screen.getByText('Confirm Reservation');
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            restaurantId: '1',
            restaurantName: 'Test Restaurant',
            date: '2024-10-15T18:00',
            numberOfPeople: 2,
          }),
        })
      );
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  test('disables confirm button when fields are not filled', () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <ReservationPage restaurant={mockRestaurant} onClose={() => {}} />
      </UserContext.Provider>
    );

    const confirmButton = screen.getByText('Confirm Reservation');
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Select Date:'), { target: { value: '2024-10-15' } });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Select Time Slot:'), { target: { value: '18:00' } });
    expect(confirmButton).not.toBeDisabled();
  });
});