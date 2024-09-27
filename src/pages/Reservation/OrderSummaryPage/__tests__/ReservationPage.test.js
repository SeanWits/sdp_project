// ReservationPage.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReservationPage from '../ReservationPage'; // Adjust the path as necessary
import { BrowserRouter } from 'react-router-dom';

test('renders reservation form fields', () => {
  render(
    <BrowserRouter>
      <ReservationPage />
    </BrowserRouter>
  );

  // Check for form labels and fields
  expect(screen.getByLabelText(/Select Date:/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Select Time Slot:/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Number of People:/i)).toBeInTheDocument();
});

test('renders time slot options', () => {
  render(
    <BrowserRouter>
      <ReservationPage />
    </BrowserRouter>
  );

  const timeSlotSelect = screen.getByLabelText(/Select Time Slot:/i);
  expect(timeSlotSelect).toBeInTheDocument();
  fireEvent.change(timeSlotSelect, { target: { value: '09:00' } });
  expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
});

test('shows alert when date is not selected on confirm', () => {
  render(
    <BrowserRouter>
      <ReservationPage />
    </BrowserRouter>
  );

  const confirmButton = screen.getByText(/Confirm Reservation/i);
  window.alert = jest.fn(); // Mock window alert
  fireEvent.click(confirmButton);
  expect(window.alert).toHaveBeenCalledWith('Please select a date.');
});
