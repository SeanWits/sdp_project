import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import Checkout from './Checkout';

// Mock the components
jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);

// Mock the react-router-dom hooks
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

const mockCartItems = [
  { productId: '1', name: 'Item 1', priceAtPurchase: 10, quantity: 2, imageSrc: 'item1.jpg' },
  { productId: '2', name: 'Item 2', priceAtPurchase: 15, quantity: 1, imageSrc: 'item2.jpg' },
];

const renderWithContext = (ui, { user = mockUser } = {}) => {
  return render(
    <UserContext.Provider value={{ user }}>
      <Router>{ui}</Router>
    </UserContext.Provider>
  );
};

describe('Checkout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockImplementation((url) => {
      if (url.includes('/cart/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: mockCartItems }),
        });
      }
      if (url.includes('/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ wallet: 100 }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders Checkout component and fetches data', async () => {
    renderWithContext(<Checkout />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-load-modal')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Item 1 (x2)')).toBeInTheDocument();
      expect(screen.getByText('Item 2 (x1)')).toBeInTheDocument();
      expect(screen.getByText('Total: R35.00')).toBeInTheDocument();
    });
  });

  test('handles payment method selection', async () => {
    renderWithContext(<Checkout />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Pay with Voucher'));
    });

    expect(screen.getByLabelText('Voucher Code:')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Pay from Wallet'));
    expect(screen.getByText('Current Wallet Balance: R100.00')).toBeInTheDocument();
  });

  test('handles item removal from cart', async () => {
    renderWithContext(<Checkout />);

    await waitFor(() => {
      const removeButtons = screen.getAllByLabelText(/Remove .* from cart/);
      fireEvent.click(removeButtons[0]);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/cart/rest001/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  test('handles successful checkout', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/checkout')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ orderId: 'mock-order-id' }),
        });
      }
      // Keep the previous implementations for other URLs
      return global.fetch(url);
    });

    global.alert = jest.fn();

    renderWithContext(<Checkout />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Confirm Purchase'));
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Purchase confirmed! Order ID: mock-order-id');
      expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
  });

  test('handles checkout failure', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/checkout')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Checkout failed' }),
        });
      }
      // Keep the previous implementations for other URLs
      return global.fetch(url);
    });

    global.alert = jest.fn();

    renderWithContext(<Checkout />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Confirm Purchase'));
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('An error occurred while processing your order: Checkout failed');
    });
  });

  test('redirects to login if user is not authenticated', () => {
    renderWithContext(<Checkout />, { user: null });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});