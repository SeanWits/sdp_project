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
  useLocation: () => ({ state: { restaurantId: 'rest001' } }),
}));
// Mock fetch
global.fetch = jest.fn();

const mockUser = {
  getIdToken: jest.fn().mockImplementation(() => Promise.resolve('mock-token')), // Make sure this returns a Promise
};

const mockCartItems = [
  { productId: '1', name: 'Item 1', priceAtPurchase: 10, quantity: 2, imageSrc: 'item1.jpg' },
  { productId: '2', name: 'Item 2', priceAtPurchase: 15, quantity: 1, imageSrc: 'item2.jpg' },
];

// Update the renderWithContext function to properly provide the mock user
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
    jest.useFakeTimers();
    
    const mockToken = 'mock-token';
    mockUser.getIdToken.mockResolvedValue(mockToken);
    
    const mockFetch = jest.fn().mockImplementation((url) => {
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
    
    global.fetch = mockFetch;
});

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders Checkout component and fetches data', async () => {
    await act(async () => {
      renderWithContext(<Checkout />);
    });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    // Initially, the loading modal should be present
    expect(screen.getByTestId('mock-load-modal')).toBeInTheDocument();

    // Wait for the loading to complete
    await act(async () => {
      jest.runAllTimers();
    });

    // Now the loading modal should not be in the document
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
    // Create a more stable mock implementation
    const mockToken = 'mock-token';
    mockUser.getIdToken.mockResolvedValue(mockToken);

    const mockFetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/cart/rest001/1')) {
            // Specific DELETE request
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ items: [mockCartItems[1]] }),
            });
        }
        if (url.includes('/cart/rest001')) {
            // Initial cart fetch
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
        return Promise.reject(new Error(`Not found: ${url}`));
    });

    global.fetch = mockFetch;

    await act(async () => {
        renderWithContext(<Checkout />);
    });

    // Wait for initial render
    await waitFor(() => {
        expect(screen.getByText('Item 1 (x2)')).toBeInTheDocument();
    });

    // Click remove button
    const removeButton = screen.getByLabelText('Remove Item 1 from cart');
    await act(async () => {
        fireEvent.click(removeButton);
    });

    // Wait for and verify the DELETE request
    await waitFor(() => {
        const deleteCall = mockFetch.mock.calls.find(call => 
            call[0].includes('/cart/rest001/1') && 
            call[1].method === 'DELETE'
        );
        expect(deleteCall).toBeTruthy();
        expect(deleteCall[1]).toMatchObject({
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${mockToken}` // Use the exact token
            }
        });
    });

    // Verify item removal from display
    await waitFor(() => {
        expect(screen.queryByText('Item 1 (x2)')).not.toBeInTheDocument();
        expect(screen.getByText('Total: R15.00')).toBeInTheDocument();
    });
});

test('handles checkout failure', async () => {
  jest.useFakeTimers();
  
  const mockToken = 'mock-token';
  mockUser.getIdToken.mockResolvedValue(mockToken);
  
  const mockFetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/checkout')) {
          return Promise.resolve({
              ok: false,
              json: () => Promise.resolve({ error: 'Checkout failed' }),
          });
      }
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

  global.fetch = mockFetch;
  global.alert = jest.fn();

  await act(async () => {
      renderWithContext(<Checkout />);
  });

  await waitFor(() => {
      expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
  });

  await act(async () => {
      fireEvent.click(screen.getByText('Confirm Purchase'));
  });

  // Advance timers
  await act(async () => {
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