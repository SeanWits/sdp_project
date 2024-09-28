// HistoryPage.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HistoryPage from '../HistoryPage'; // Adjust the path as necessary
import { BrowserRouter } from 'react-router-dom';
import { db } from '../../../__mocks__/firebase'; // Mock Firebase Firestore

jest.mock('../../../__mocks__/firebase', () => ({
  db: {
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    deleteDoc: jest.fn(),
  },
}));

test('renders loading message initially', () => {
  render(
    <BrowserRouter>
      <HistoryPage />
    </BrowserRouter>
  );
  
  expect(screen.getByText(/Loading reservations.../i)).toBeInTheDocument();
});

test('renders reservation list after fetching', async () => {
  const mockReservations = [
    { id: 'res1', restaurant: 'Restaurant XYZ', date: { toDate: () => new Date() }, numberOfPeople: 4 },
  ];

  db.getDocs.mockResolvedValue({
    docs: mockReservations.map(reservation => ({
      id: reservation.id,
      data: () => reservation,
    })),
  });

  render(
    <BrowserRouter>
      <HistoryPage />
    </BrowserRouter>
  );

  await waitFor(() => expect(screen.getByText(/Restaurant XYZ/i)).toBeInTheDocument());
  expect(screen.getByText(/Number of People: 4/i)).toBeInTheDocument();
});

test('allows reservation cancellation if more than 1 hour before the reservation', async () => {
  const mockReservations = [
    { 
      id: 'res1', 
      restaurant: 'Restaurant XYZ', 
      date: { toDate: () => new Date(new Date().getTime() + 2 * 60 * 60 * 1000) }, // 2 hours from now
      numberOfPeople: 4 
    },
  ];

  db.getDocs.mockResolvedValue({
    docs: mockReservations.map(reservation => ({
      id: reservation.id,
      data: () => reservation,
    })),
  });

  render(
    <BrowserRouter>
      <HistoryPage />
    </BrowserRouter>
  );

  await waitFor(() => expect(screen.getByText(/Cancel Reservation/i)).toBeInTheDocument());

  const cancelButton = screen.getByText(/Cancel Reservation/i);
  fireEvent.click(cancelButton);
  expect(db.deleteDoc).toHaveBeenCalledWith(expect.anything());
});
