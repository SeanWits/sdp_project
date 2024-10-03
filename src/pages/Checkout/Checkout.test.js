import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
  Link: ({ children, to }) => <a href={to}>{children}</a>,
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
    await act(async () => {
      renderWithContext(<Checkout />);
    });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId('mock-load-modal')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Item 1 (x2)')).toBeInTheDocument();
    expect(screen.getByText('Item 2 (x1)')).toBeInTheDocument();
    expect(screen.getByText('Total: R35.00')).toBeInTheDocument();
    expect(screen.getByText('Wallet Balance: R100.00')).toBeInTheDocument();
  });

  test('handles item removal from cart', async () => {
    let fetchCallCount = 0;
    global.fetch.mockImplementation((url) => {
      fetchCallCount++;
      if (url.includes('/cart/')) {
        if (fetchCallCount === 1) {
          // Initial cart fetch
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ items: mockCartItems }),
          });
        } else {
          // After item removal
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ items: [mockCartItems[1]] }),
          });
        }
      }
      if (url.includes('/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ wallet: 100 }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      renderWithContext(<Checkout />);
    });

    // Wait for the cart items to be rendered
    await waitFor(() => {
      expect(screen.getByText('Item 1 (x2)')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText('Remove Item 1 from cart');
    await act(async () => {
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cart/rest001/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    // Check if the item has been removed from the display
    await waitFor(() => {
      expect(screen.queryByText('Item 1 (x2)')).not.toBeInTheDocument();
      expect(screen.getByText('Total: R15.00')).toBeInTheDocument(); // Updated total
    });
  });

  test('handles successful checkout', async () => {
    jest.useFakeTimers();
    global.fetch.mockImplementation((url) => {
      if (url.includes('/checkout')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ orderId: 'mock-order-id' }),
        });
      }
      return global.fetch(url);
    });
  
    global.alert = jest.fn();
  
    await act(async () => {
      renderWithContext(<Checkout />);
    });
  
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Purchase'));
    });
  
    act(() => {
      jest.advanceTimersByTime(2000);
    });
  
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Purchase confirmed! Order ID: mock-order-id');
      expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
  
    jest.useRealTimers();
  });

  test('handles checkout failure', async () => {
    jest.useFakeTimers();
    global.fetch.mockImplementation((url) => {
      if (url.includes('/checkout')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Checkout failed' }),
        });
      }
      return global.fetch(url);
    });
  
    global.alert = jest.fn();
  
    await act(async () => {
      renderWithContext(<Checkout />);
    });
  
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Purchase'));
    });
  
    act(() => {
      jest.advanceTimersByTime(2000);
    });
  
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('An error occurred while processing your order: Checkout failed');
    });
  
    jest.useRealTimers();
  });

  test('disables purchase button when wallet balance is insufficient', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ wallet: 30 }),
        });
      }
      if (url.includes('/cart/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: mockCartItems }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      renderWithContext(<Checkout />);
    });

    await waitFor(() => {
      expect(screen.getByText('Total: R35.00')).toBeInTheDocument();
    });

    const purchaseButton = screen.getByRole('button', { name: 'Insufficient Funds' });
    expect(purchaseButton).toBeDisabled();
  });

  test('redirects to login if user is not authenticated', () => {
    renderWithContext(<Checkout />, { user: null });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});