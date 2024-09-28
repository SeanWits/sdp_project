import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Menu from './Menu';

// Mock the modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ restaurantId: '123' }),
  useLocation: () => ({ state: { restaurant: null } }),
}));

jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);

// Mock fetch
global.fetch = jest.fn();

const mockRestaurant = {
  name: 'Test Restaurant',
  categories: [
    {
      name: 'Appetizers',
      description: 'Delicious starters',
      menu_items: [
        { name: 'Nachos', description: 'Cheesy nachos', price: 9.99, is_available: true, image_url: 'nachos.jpg' },
        { name: 'Wings', description: 'Spicy wings', price: 12.99, is_available: true, image_url: 'wings.jpg' },
      ],
    },
    {
      name: 'Main Course',
      description: 'Hearty meals',
      menu_items: [
        { name: 'Burger', description: 'Juicy burger', price: 14.99, is_available: true, image_url: 'burger.jpg' },
        { name: 'Pizza', description: 'Pepperoni pizza', price: 16.99, is_available: false, image_url: 'pizza.jpg' },
      ],
    },
  ],
};

const renderWithRouter = (ui, { route = '/menu/123' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <Router>{ui}</Router>
  );
};

describe('Menu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRestaurant),
    });
  });

  test('renders Menu component and fetches data', async () => {
    renderWithRouter(<Menu />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Appetizers')).toBeInTheDocument();
      expect(screen.getByText('Main Course')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/restaurant/123`
    );
  });

  test('displays menu items for the selected category', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('Nachos')).toBeInTheDocument();
      expect(screen.getByText('Wings')).toBeInTheDocument();
      expect(screen.queryByText('Burger')).not.toBeInTheDocument();
    });
  });

  test('changes category when clicked', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Main Course'));
    });

    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Nachos')).not.toBeInTheDocument();
  });

  test('displays item availability', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Main Course'));
    });

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  test('renders item images', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'nachos.jpg');
      expect(images[1]).toHaveAttribute('src', 'wings.jpg');
    });
  });

  test('navigates to item page when clicked', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      const nachoLink = screen.getByText('Nachos').closest('a');
      expect(nachoLink).toHaveAttribute('href', '/menu/123/Nachos');
    });
  });

  test('displays loading state', () => {
    renderWithRouter(<Menu />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('handles no menu categories', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockRestaurant, categories: [] }),
    });

    renderWithRouter(<Menu />);

    await waitFor(() => {
      expect(screen.getByText('No menu categories available')).toBeInTheDocument();
    });
  });

  test('renders back arrow', async () => {
    renderWithRouter(<Menu />);

    await waitFor(() => {
      const backLink = screen.getByText('←');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });
  });
});