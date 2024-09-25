import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Menu from './Menu';
import { getDoc } from 'firebase/firestore';

jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ restaurantId: 'test-restaurant-id' }),
  useLocation: () => ({ state: null }),
}));

jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);

const mockRestaurantData = {
  id: 'test-restaurant-id',
  name: 'Test Restaurant',
  categories: [
    {
      name: 'Appetizers',
      description: 'Delicious starters',
      menu_items: [
        {
          name: 'Spring Rolls',
          description: 'Crispy vegetable spring rolls',
          price: 5.99,
          is_available: true,
          image_url: 'http://example.com/spring-rolls.jpg',
        },
      ],
    },
    {
      name: 'Main Course',
      description: 'Satisfying entrees',
      menu_items: [
        {
          name: 'Burger',
          description: 'Juicy beef burger',
          price: 12.99,
          is_available: true,
          image_url: 'http://example.com/burger.jpg',
        },
      ],
    },
  ],
};

const renderWithRouter = (ui, { route = '/menu/test-restaurant-id' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: Router });
};

describe('Menu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockRestaurantData,
      id: 'test-restaurant-id',
    });
  });

  test('renders loading state initially', async () => {
    renderWithRouter(<Menu />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders restaurant menu after loading', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Appetizers')).toBeInTheDocument();
      expect(screen.getByText('Spring Rolls')).toBeInTheDocument();
      expect(screen.getByText('Price: R5.99')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByAltText('Spring Rolls')).toBeInTheDocument();
    });
  });

  test('changes category when clicking on a different category', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('Appetizers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Main Course'));

    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Price: R12.99')).toBeInTheDocument();
    });
  });

  test('renders error message when restaurant is not found', async () => {
    getDoc.mockResolvedValue({
      exists: () => false,
    });

    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('Error: Restaurant not found')).toBeInTheDocument();
    });
  });

  test('renders error message when there is a problem fetching data', async () => {
    getDoc.mockRejectedValue(new Error('Fetch error'));

    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
    });
  });

  test('renders Header and Footer components', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });

  test('renders back arrow link', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      const backArrow = screen.getByText('←');
      expect(backArrow).toBeInTheDocument();
      expect(backArrow.closest('a')).toHaveAttribute('href', '/');
    });
  });
});