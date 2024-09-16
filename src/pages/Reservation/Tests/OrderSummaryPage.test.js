import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderSummaryPage from '../OrderSummaryPage';
import { getDoc } from '../../../firebase';

// Mock Firebase getDoc
jest.mock('../../firebase',  () => ({
  getDoc: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
useNavigate.mockImplementation(() => mockNavigate);

describe('OrderSummaryPage', () => {
  beforeEach(() => {
    localStorage.setItem('reservationId', 'jcs5GQWzrCR58dBtAZi7');
  });

  it('renders order summary correctly when reservation exists', async () => {
    // Mocking Firestore data
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        restaurant: 'Restaurant XYZ',
        date: {
          toDate: () => new Date('2024-09-14T14:26:07'),
        },
        numberOfPeople: 2,
        selectedFood: 'None',
      }),
    });

    render(
      <MemoryRouter>
        <OrderSummaryPage />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => screen.getByText('Order Summary'));

    expect(screen.getByText('Restaurant:')).toBeInTheDocument();
    expect(screen.getByText('Restaurant XYZ')).toBeInTheDocument();
    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('14 September 2024, 14:26:07')).toBeInTheDocument();
    expect(screen.getByText('Number of People:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Food Selected:')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('handles missing reservation and redirects', async () => {
    // Simulate no document found
    getDoc.mockResolvedValue({
      exists: () => false,
    });

    render(
      <MemoryRouter>
        <OrderSummaryPage />
      </MemoryRouter>
    );

    // Wait for the navigation to be triggered
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('clears localStorage and navigates on "Done" click', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        restaurant: 'Restaurant XYZ',
        date: {
          toDate: () => new Date('2024-09-14T14:26:07'),
        },
        numberOfPeople: 2,
        selectedFood: 'None',
      }),
    });

    render(
      <MemoryRouter>
        <OrderSummaryPage />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => screen.getByText('Done'));

    fireEvent.click(screen.getByText('Done'));

    expect(localStorage.getItem('reservationId')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
