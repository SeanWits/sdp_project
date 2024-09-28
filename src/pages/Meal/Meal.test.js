import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import Meal from './Meal';

// Mock the dependencies
jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => (
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

const renderWithRouter = (ui, { route = '/menu/123/burger', user = null } = {}) => {
  return render(
    <UserContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/menu/:restaurantId/:itemName" element={ui} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );
};

describe('Meal Component', () => {
  const mockItem = {
    name: 'Burger',
    description: 'Delicious burger',
    price: 10.99,
    image_url: 'burger.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ item: mockItem, restaurantName: 'Test Restaurant' }),
    });
  });

  test('renders Meal component and fetches data', async () => {
    renderWithRouter(<Meal />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Delicious burger')).toBeInTheDocument();
      expect(screen.getByText('Total: R10.99')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/123/menu-item/burger`
    );
  });

  test('handles size selection', async () => {
    renderWithRouter(<Meal />);

    await waitFor(() => {
      const smallRadio = screen.getByLabelText('Small');
      const largeRadio = screen.getByLabelText('Large');

      expect(smallRadio).toBeChecked();
      fireEvent.click(largeRadio);
      expect(largeRadio).toBeChecked();
    });
  });

  test('adds item to cart for logged-in user', async () => {
    renderWithRouter(<Meal />, { user: mockUser });

    await waitFor(() => {
      const addToCartButton = screen.getByText('Add to cart');
      fireEvent.click(addToCartButton);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/cart/add`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token',
        }),
      })
    );
  });

  test('redirects to login for guest user', async () => {
    renderWithRouter(<Meal />);

    await waitFor(() => {
      const addToCartButton = screen.getByText('Add to cart');
      fireEvent.click(addToCartButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything());
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    renderWithRouter(<Meal />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching item:', expect.any(Error));
      expect(screen.getByText('Error: Failed to load item data')).toBeInTheDocument();
    });
  });

  test('displays loading state', () => {
    renderWithRouter(<Meal />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders review button', async () => {
    renderWithRouter(<Meal />);

    await waitFor(() => {
      expect(screen.getByText('Click For Review')).toBeInTheDocument();
    });
  });

  test('navigates back to menu', async () => {
    renderWithRouter(<Meal />);

    await waitFor(() => {
      const backLink = screen.getByText('←');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/menu/123');
    });
  });
});