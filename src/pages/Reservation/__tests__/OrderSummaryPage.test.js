import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OrderSummaryPage from '../OrderSummaryPage'; // Adjust the path as necessary
import { BrowserRouter } from 'react-router-dom';
import { db, doc, getDoc } from '../../../__mocks__/firebase'; // Mock Firebase Firestore
import { useNavigate } from 'react-router-dom';

// Mock necessary Firebase functions
jest.mock('../../../__mocks__/firebase', () => ({
  db: {},
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock React Router's useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => (store[key] = value.toString())),
    removeItem: jest.fn((key) => delete store[key]),
    clear: jest.fn(() => (store = {})),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

test('renders order summary with fetched reservation data', async () => {
  // Mock reservation data
  const mockReservationData = {
    restaurant: 'Restaurant XYZ',
    date: { toDate: () => new Date() },
    numberOfPeople: 4,
    selectedFood: 'Pasta',
  };

  // Mock getDoc to return the mock reservation data
  getDoc.mockResolvedValue({
    exists: () => true,
    data: () => mockReservationData,
  });

  // Mock localStorage to return a reservation ID
  localStorage.getItem.mockReturnValue('mockReservationId');

  render(
    <BrowserRouter>
      <OrderSummaryPage />
    </BrowserRouter>
  );

  // Check if loading the reservation data and then rendering it correctly
  await waitFor(() => {
    expect(screen.getByText(/Restaurant:/i)).toBeInTheDocument();
    expect(screen.getByText(/Restaurant XYZ/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of People:/i)).toBeInTheDocument();
    expect(screen.getByText(/4/i)).toBeInTheDocument();
    expect(screen.getByText(/Food Selected:/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasta/i)).toBeInTheDocument();
  });
});

test('redirects to reservation page if no reservationId in localStorage', () => {
  const navigateMock = useNavigate.mockReturnValue(jest.fn());

  // Mock localStorage to return null for reservationId
  localStorage.getItem.mockReturnValue(null);

  render(
    <BrowserRouter>
      <OrderSummaryPage />
    </BrowserRouter>
  );

  // Assert that the user is redirected
  expect(navigateMock).toHaveBeenCalledWith('/');
});

test('clears reservationId from localStorage and navigates to history page on "Done" button click', async () => {
  const navigateMock = useNavigate.mockReturnValue(jest.fn());

  // Mock reservation data
  const mockReservationData = {
    restaurant: 'Restaurant XYZ',
    date: { toDate: () => new Date() },
    numberOfPeople: 4,
    selectedFood: 'Pasta',
  };

  getDoc.mockResolvedValue({
    exists: () => true,
    data: () => mockReservationData,
  });

  localStorage.getItem.mockReturnValue('mockReservationId');

  render(
    <BrowserRouter>
      <OrderSummaryPage />
    </BrowserRouter>
  );

  // Wait for reservation data to be fetched
  await waitFor(() => screen.getByText(/Done/i));

  // Click the "Done" button
  fireEvent.click(screen.getByText(/Done/i));

  // Check that reservationId was removed from localStorage and navigation occurred
  expect(localStorage.removeItem).toHaveBeenCalledWith('reservationId');
  expect(navigateMock).toHaveBeenCalledWith('/history');
});
