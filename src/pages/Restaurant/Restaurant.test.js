import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Restaurant from './Restaurant';
import { collection, getDocs } from 'firebase/firestore';

jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);

const mockRestaurants = [
  {
    id: 'rest1',
    name: 'Restaurant 1',
    location: 'Location 1',
    opening_time: '9:00 AM',
    closing_time: '10:00 PM',
    rating: '4.5',
    restImg: 'http://example.com/rest1.jpg'
  },
  {
    id: 'rest2',
    name: 'Restaurant 2',
    location: 'Location 2',
    opening_time: '8:00 AM',
    closing_time: '11:00 PM',
    rating: '4.0',
    restImg: 'http://example.com/rest2.jpg'
  }
];

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: Router });
};

describe('Restaurant Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDocs.mockResolvedValue({
      docs: mockRestaurants.map(rest => ({
        id: rest.id,
        data: () => rest
      }))
    });
  });

  test('renders loading state initially', () => {
    renderWithRouter(<Restaurant />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders restaurant list after loading', async () => {
    renderWithRouter(<Restaurant />);

    await waitFor(() => {
      expect(screen.getByText('Restaurant 1')).toBeInTheDocument();
      expect(screen.getByText('Restaurant 2')).toBeInTheDocument();
      expect(screen.getByText('Location: Location 1')).toBeInTheDocument();
      expect(screen.getByText('Hours: 9:00 AM - 10:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Rating: 4.5')).toBeInTheDocument();
      expect(screen.getAllByText('Menu')[0]).toBeInTheDocument();
      expect(screen.getAllByText('More Info')[0]).toBeInTheDocument();
    });
  });

  test('renders error message when there is a problem fetching data', async () => {
    getDocs.mockRejectedValue(new Error('Fetch error'));

    renderWithRouter(<Restaurant />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
    });
  });

  test('renders "No restaurant data available" when the list is empty', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    renderWithRouter(<Restaurant />);

    await waitFor(() => {
      expect(screen.getByText('No restaurant data available')).toBeInTheDocument();
    });
  });

  test('renders Header and Footer components', async () => {
    renderWithRouter(<Restaurant />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });

  test('renders correct number of restaurant items', async () => {
    renderWithRouter(<Restaurant />);

    await waitFor(() => {
      const restaurantItems = screen.getAllByRole('article');
      expect(restaurantItems).toHaveLength(mockRestaurants.length);
    });
  });

  test('renders restaurant images when available', async () => {
    renderWithRouter(<Restaurant />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(mockRestaurants.length);
      expect(images[0]).toHaveAttribute('src', mockRestaurants[0].restImg);
      expect(images[1]).toHaveAttribute('src', mockRestaurants[1].restImg);
    });
  });

  test('renders Menu and More Info buttons for each restaurant', async () => {
    renderWithRouter(<Restaurant />);

    await waitFor(() => {
      const menuButtons = screen.getAllByText('Menu');
      const moreInfoButtons = screen.getAllByText('More Info');
      expect(menuButtons).toHaveLength(mockRestaurants.length);
      expect(moreInfoButtons).toHaveLength(mockRestaurants.length);
    });
  });
});