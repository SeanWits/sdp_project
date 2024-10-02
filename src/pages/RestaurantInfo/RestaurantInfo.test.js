import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import RestaurantInfo from './RestaurantInfo';

// Mock the components and modules
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);
jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../Reviews/Popup/Popup', () => ({ children, isOpen, onClose }) => 
  isOpen ? <div data-testid="mock-popup">{children}<button onClick={onClose}>Close</button></div> : null
);
jest.mock('../Reviews/Reviews', () => ({ Reviews: () => <div>Mock Reviews</div> }));

// Mock react-router-dom hooks
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
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();

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

  test('displays fallback text for missing information', async () => {
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
      expect(screen.getByText('Contact details: No Contact Details')).toBeInTheDocument();
      expect(screen.getByText('Telephone: No Telephone')).toBeInTheDocument();
      expect(screen.getByText('Email: No Email')).toBeInTheDocument();
      expect(screen.getByText('Rating: No Rating')).toBeInTheDocument();
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
      const backArrow = screen.getByText('arrow_back_ios_new');
      expect(backArrow).toBeInTheDocument();
      expect(backArrow.closest('a')).toHaveAttribute('href', '/');
    });
  });

  test('renders "Click For Review" button and opens popup', async () => {
    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      const reviewButton = screen.getByText('Click For Review');
      expect(reviewButton).toBeInTheDocument();
      fireEvent.click(reviewButton);
    });

    expect(screen.getByTestId('mock-popup')).toBeInTheDocument();
    expect(screen.getByText('Mock Reviews')).toBeInTheDocument();
  });

  test('closes popup when close button is clicked', async () => {
    await act(async () => {
      render(
        <Router>
          <RestaurantInfo />
        </Router>
      );
    });

    await waitFor(() => {
      const reviewButton = screen.getByText('Click For Review');
      fireEvent.click(reviewButton);
    });

    expect(screen.getByTestId('mock-popup')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));

    expect(screen.queryByTestId('mock-popup')).not.toBeInTheDocument();
  });
});