import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Restaurant from './Restaurant';

// Mock the components
jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);

// Mock fetch
global.fetch = jest.fn();

const mockRestaurants = [
  {
    id: '1',
    name: 'Test Restaurant 1',
    location: 'Test Location 1',
    opening_time: '9:00 AM',
    closing_time: '10:00 PM',
    rating: 4.5,
    restImg: 'test-image-1.jpg'
  },
  {
    id: '2',
    name: 'Test Restaurant 2',
    location: 'Test Location 2',
    opening_time: '8:00 AM',
    closing_time: '11:00 PM',
    rating: null,
    restImg: null
  }
];

describe('Restaurant Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRestaurants),
    });
  });

  test('renders Restaurant component and fetches data', async () => {
    await act(async () => {
      render(
        <Router>
          <Restaurant />
        </Router>
      );
    });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByText('Restaurant/Dining Hall Name')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant 1')).toBeInTheDocument();
      expect(screen.getByText('Test Restaurant 2')).toBeInTheDocument();
    });
  });

  test('displays restaurant details correctly', async () => {
    await act(async () => {
      render(
        <Router>
          <Restaurant />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Location: Test Location 1')).toBeInTheDocument();
      expect(screen.getByText('Hours: 9:00 AM - 10:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Rating: 4.5')).toBeInTheDocument();
    });
  });

  test('handles missing rating and image', async () => {
    await act(async () => {
      render(
        <Router>
          <Restaurant />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Rating: N/A')).toBeInTheDocument();
    });

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1); // Only one restaurant has an image
  });

  test('renders navigation buttons for each restaurant', async () => {
    await act(async () => {
      render(
        <Router>
          <Restaurant />
        </Router>
      );
    });

    await waitFor(() => {
      const menuButtons = screen.getAllByText('Menu');
      const reservationButtons = screen.getAllByText('Reservation');
      const moreInfoButtons = screen.getAllByText('More Info');

      expect(menuButtons).toHaveLength(2);
      expect(reservationButtons).toHaveLength(2);
      expect(moreInfoButtons).toHaveLength(2);
    });
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    await act(async () => {
      render(
        <Router>
          <Restaurant />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('Error fetching restaurants:', expect.any(Error));
    });
  });

  test('displays message when no restaurant data is available', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await act(async () => {
      render(
        <Router>
          <Restaurant />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('No restaurant data available')).toBeInTheDocument();
    });
  });

  test('shows loading state', async () => {
    render(
      <Router>
        <Restaurant />
      </Router>
    );

    expect(screen.getByTestId('mock-load-modal')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('mock-load-modal')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });
});