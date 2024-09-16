import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ReservationPage from '../ReservationPage';
import { setDoc } from '../../../firebase';

// Mock Firebase setDoc and useNavigate
jest.mock('../../../__mocks__/firebase',  () => ({
  setDoc: jest.fn(),
}));


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
useNavigate.mockImplementation(() => mockNavigate);

describe('ReservationPage Component', () => {
    test('renders the ReservationPage component', () => {
      render(<ReservationPage />);
      const headingElement = screen.getByText(/Make a Reservation/i);
      expect(headingElement).toBeInTheDocument();
    });
  });

describe('ReservationPage', () => {
  it('renders reservation form correctly', () => {
    render(
      <MemoryRouter>
        <ReservationPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Select Date, Time Slot & Number of People')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Time Slot:')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of People:')).toBeInTheDocument();
  });

  it('handles form submission and stores reservation in Firestore', () => {
    render(
      <MemoryRouter>
        <ReservationPage />
      </MemoryRouter>
    );

    // Simulate user input
    fireEvent.change(screen.getByLabelText('Select Date:'), { target: { value: '2024-09-14' } });
    fireEvent.change(screen.getByLabelText('Select Time Slot:'), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText('Number of People:'), { target: { value: '2' } });

    // Click the confirm button
    fireEvent.click(screen.getByText('Confirm Reservation'));

    // Ensure setDoc was called with correct arguments
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        restaurant: 'Restaurant XYZ',
        date: expect.any(Object), // This would be a Firestore Timestamp object
        numberOfPeople: 2,
        userID: 'vutshila',
      })
    );

    // Ensure user is navigated to the order summary page
    expect(mockNavigate).toHaveBeenCalledWith('/order-summary');
  });

  it('shows an error if date is not selected', () => {
    render(
      <MemoryRouter>
        <ReservationPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Confirm Reservation'));
    expect(screen.getByText('Please select a date.')).toBeInTheDocument();
  });
});
