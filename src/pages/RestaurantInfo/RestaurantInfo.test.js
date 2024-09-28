import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import RestaurantInfo from './RestaurantInfo';

// Mock the LoadModal component
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-id' }),
  useLocation: () => ({ state: {} }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock fetch
global.fetch = jest.fn();

const mockRestaurant = {
  id: 'test-id',
  name: 'Test Restaurant',
  location: 'Test Location',
  opening_time: '9:00 AM',
  closing_time: '10:00 PM',
  contact_details: 'Test Contact',
  telephone: '123-456-7890',
  email: 'test@restaurant.com',
  rating: 4.5,
  restImg: 'test-image.jpg'
};

describe('RestaurantInfo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRestaurant),
    });
  });

  test('renders RestaurantInfo component and fetches data', async () => {
    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    expect(screen.getByTestId('mock-load-modal')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Location: Test Location')).toBeInTheDocument();
      expect(screen.getByText('Operating Hours: 9:00 AM - 10:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Contact details: Test Contact')).toBeInTheDocument();
      expect(screen.getByText('Telephone: 123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('Email: test@restaurant.com')).toBeInTheDocument();
      expect(screen.getByText('Rating: 4.5')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('mock-load-modal')).not.toBeInTheDocument();
  });

  test('displays N/A for missing information', async () => {
    const incompleteRestaurant = { ...mockRestaurant, contact_details: null, telephone: null, email: null, rating: null };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(incompleteRestaurant),
    });

    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Contact details: N/A')).toBeInTheDocument();
      expect(screen.getByText('Telephone: N/A')).toBeInTheDocument();
      expect(screen.getByText('Email: N/A')).toBeInTheDocument();
      expect(screen.getByText('Rating: N/A')).toBeInTheDocument();
    });
  });

  test('renders restaurant image when available', async () => {
    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      const image = screen.getByAltText('Test Restaurant');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'test-image.jpg');
    });
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('Error fetching restaurant:', expect.any(Error));
    });
  });

  test('displays message when no restaurant data is available', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('No restaurant data available')).toBeInTheDocument();
    });
  });

  test('renders back arrow link', async () => {
    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      const backLink = screen.getByText('←');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  test('renders "Click For Review" button', async () => {
    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Click For Review')).toBeInTheDocument();
    });
  });
});