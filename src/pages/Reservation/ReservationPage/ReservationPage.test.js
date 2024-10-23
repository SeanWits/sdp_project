import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  const renderReservationPage = () => {
    return render(
      <UserContext.Provider value={{ user: mockUser }}>
        <ReservationPage 
          restaurant={mockRestaurant} 
          onClose={() => {}} 
          onReservationMade={() => {}}
        />
      </UserContext.Provider>
    );
  };

  test('sets minimum date for date input', () => {
    renderReservationPage();
    const dateInput = screen.getByLabelText('Select Date:');
    expect(dateInput).toHaveAttribute('min', '2024-10-02');
  });

  test('generates correct time slots', async () => {
    renderReservationPage();
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
    renderReservationPage();
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

  describe('Number of People input', () => {
    test('allows manual input of numbers', () => {
      renderReservationPage();
      const peopleInput = screen.getByLabelText('Number of People:');
      
      fireEvent.change(peopleInput, { target: { value: '4' } });
      expect(peopleInput.value).toBe('4');
    });

    test('allows temporary input outside range while typing', () => {
      renderReservationPage();
      const peopleInput = screen.getByLabelText('Number of People:');
      
      fireEvent.change(peopleInput, { target: { value: '12' } });
      expect(peopleInput.value).toBe('12');
    });

    test('enforces minimum value on blur', () => {
      renderReservationPage();
      const peopleInput = screen.getByLabelText('Number of People:');
      
      fireEvent.change(peopleInput, { target: { value: '0' } });
      fireEvent.blur(peopleInput);
      expect(peopleInput.value).toBe('1');
    });

    test('enforces maximum value on blur', () => {
      renderReservationPage();
      const peopleInput = screen.getByLabelText('Number of People:');
      
      fireEvent.change(peopleInput, { target: { value: '10' } });
      fireEvent.blur(peopleInput);
      expect(peopleInput.value).toBe('8');
    });

    test('handles empty input on blur', () => {
      renderReservationPage();
      const peopleInput = screen.getByLabelText('Number of People:');
      
      fireEvent.change(peopleInput, { target: { value: '' } });
      fireEvent.blur(peopleInput);
      expect(peopleInput.value).toBe('1');
    });
  });

  test('handles reservation confirmation with all fields filled', async () => {
    const onReservationMadeMock = jest.fn();
    const onCloseMock = jest.fn();

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <ReservationPage 
          restaurant={mockRestaurant} 
          onClose={onCloseMock}
          onReservationMade={onReservationMadeMock}
        />
      </UserContext.Provider>
    );

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Select Date:'), { 
      target: { value: '2024-10-15' } 
    });
    
    await waitFor(() => {
      const timeSelect = screen.getByLabelText('Select Time Slot:');
      fireEvent.change(timeSelect, { target: { value: '18:00' } });
    });

    fireEvent.change(screen.getByLabelText('Number of People:'), { 
      target: { value: '2' } 
    });

    // Mock successful API response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    // Submit the reservation
    const confirmButton = screen.getByText('Confirm Reservation');
    expect(confirmButton).not.toBeDisabled();
    fireEvent.click(confirmButton);

    // Verify API call and callbacks
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            restaurantId: '1',
            restaurantName: 'Test Restaurant',
            date: '2024-10-15T18:00',
            numberOfPeople: 2,
          }),
        })
      );
      expect(onReservationMadeMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  test('handles API error during reservation submission', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    );

    renderReservationPage();

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Select Date:'), { 
      target: { value: '2024-10-15' } 
    });
    
    await waitFor(() => {
      const timeSelect = screen.getByLabelText('Select Time Slot:');
      fireEvent.change(timeSelect, { target: { value: '18:00' } });
    });

    // Submit the reservation
    const confirmButton = screen.getByText('Confirm Reservation');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error adding reservation: ",
        expect.any(Error)
      );
      expect(alertMock).toHaveBeenCalledWith(
        "Failed to create reservation. Please try again."
      );
    });

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });

  test('disables confirm button when fields are not filled', async () => {
    renderReservationPage();
    const confirmButton = screen.getByText('Confirm Reservation');
    
    // Initially disabled
    expect(confirmButton).toBeDisabled();

    // Still disabled with only date
    fireEvent.change(screen.getByLabelText('Select Date:'), { 
      target: { value: '2024-10-15' } 
    });
    expect(confirmButton).toBeDisabled();

    // Enabled when both date and time are filled
    await waitFor(() => {
      const timeSelect = screen.getByLabelText('Select Time Slot:');
      fireEvent.change(timeSelect, { target: { value: '18:00' } });
    });
    expect(confirmButton).not.toBeDisabled();
  });
});