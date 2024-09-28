import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import Cart from './Cart';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../components/LoadModal/LoadModal', () => {
  return function DummyLoadModal({ loading }) {
    return loading ? <div>Loading...</div> : null;
  };
});

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

const renderWithRouter = (ui, { route = '/', user = null } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <UserContext.Provider value={{ user }}>
      <Router>{ui}</Router>
    </UserContext.Provider>
  );
};

describe('Cart Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    restaurantID: 'mock-restaurant-id',
  };

  const mockCartItems = [
    { productId: '1', name: 'Item 1', priceAtPurchase: 10, quantity: 2, imageSrc: 'item1.jpg' },
    { productId: '2', name: 'Item 2', priceAtPurchase: 15, quantity: 1, imageSrc: 'item2.jpg' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: mockCartItems }),
    });
  });

  test('renders cart when open', async () => {
    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    await waitFor(() => {
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  test('does not render when isOpen is false', () => {
    renderWithRouter(<Cart {...mockProps} isOpen={false} />, { user: mockUser });
    expect(screen.queryByText('Cart')).not.toBeInTheDocument();
  });

  test('calculates and displays total correctly', async () => {
    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    await waitFor(() => {
      expect(screen.getByText('Total: R35.00')).toBeInTheDocument();
    });
  });

  test('updates item quantity', async () => {
    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    await waitFor(() => {
      const increaseButtons = screen.getAllByLabelText(/Increase quantity of/);
      fireEvent.click(increaseButtons[0]);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cart/mock-restaurant-id/update'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productId: '1', quantity: 3 }),
      })
    );
  });

  test('removes item from cart', async () => {
    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/Remove .* from cart/);
      fireEvent.click(deleteButtons[0]);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cart/mock-restaurant-id/1'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  test('navigates to checkout when checkout button is clicked', async () => {
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);

    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    await waitFor(() => {
      const checkoutButton = screen.getByText('Checkout');
      fireEvent.click(checkoutButton);
    });

    expect(navigate).toHaveBeenCalledWith('/checkout');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('closes cart when close button is clicked', async () => {
    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    await waitFor(() => {
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
    });

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('displays loading state', async () => {
    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  test('handles fetch error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    console.error = jest.fn();

    renderWithRouter(<Cart {...mockProps} />, { user: mockUser });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching cart:',
        expect.any(Error)
      );
    });
  });
});