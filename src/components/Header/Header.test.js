import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';
import { UserContext } from '../../utils/userContext';

jest.mock('../../firebase', () => ({
  db: {},
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('../Cart/Cart', () => ({ isOpen, onClose }) => 
  isOpen ? <div data-testid="mock-cart" onClick={onClose}>Mock Cart</div> : null
);

// Mock fetch globally
global.fetch = jest.fn();

const renderHeader = (user = null, props = {}) => {
  return render(
    <Router>
      <UserContext.Provider value={{ user }}>
        <Header {...props} />
      </UserContext.Provider>
    </Router>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [{ quantity: 2 }, { quantity: 3 }] }),
    });
  });

  test('renders without crashing', () => {
    renderHeader();
    expect(screen.getByText('Campus Bites')).toBeInTheDocument();
  });


  test('updates cart item count', async () => {
    const mockUser = { 
      uid: 'testUser',
      getIdToken: jest.fn().mockResolvedValue('mock-token')
    };

    await act(async () => {
      renderHeader(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('handles navigation for logged in user', async () => {
    const mockUser = { uid: 'testUser', getIdToken: jest.fn().mockResolvedValue('mock-token') };
    await act(async () => {
      renderHeader(mockUser);
    });

    fireEvent.click(screen.getByText('person'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

    fireEvent.click(screen.getByText('receipt'));
    expect(mockNavigate).toHaveBeenCalledWith('/orders');
  });

  test('handles navigation for logged out user', () => {
    renderHeader();

    fireEvent.click(screen.getByText('person'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    fireEvent.click(screen.getByText('receipt'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('toggles cart for logged in user', async () => {
    const mockUser = { uid: 'testUser', getIdToken: jest.fn().mockResolvedValue('mock-token') };
    await act(async () => {
      renderHeader(mockUser);
    });

    fireEvent.click(screen.getByText('shopping_basket'));
    expect(screen.getByTestId('mock-cart')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-cart'));
    expect(screen.queryByTestId('mock-cart')).not.toBeInTheDocument();
  });

  test('navigates to login when cart is clicked for logged out user', () => {
    renderHeader();

    fireEvent.click(screen.getByText('shopping_basket'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('disables cart when disableCart prop is true', async () => {
    const mockUser = { uid: 'testUser', getIdToken: jest.fn().mockResolvedValue('mock-token') };
    await act(async () => {
      renderHeader(mockUser, { disableCart: true });
    });

    expect(screen.getByText('shopping_basket').closest('div')).toHaveClass('disabled');
    fireEvent.click(screen.getByText('shopping_basket'));
    expect(screen.queryByTestId('mock-cart')).not.toBeInTheDocument();
  });

  test('disables orders when disableOrders prop is true', () => {
    const mockUser = { uid: 'testUser', getIdToken: jest.fn().mockResolvedValue('mock-token') };
    renderHeader(mockUser, { disableOrders: true });

    expect(screen.getByText('receipt')).toHaveClass('disabled');
    fireEvent.click(screen.getByText('receipt'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles cart update event', async () => {
    const mockUser = { uid: 'testUser', getIdToken: jest.fn().mockResolvedValue('mock-token') };
    await act(async () => {
      renderHeader(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    // Mock a new cart state
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [{ quantity: 1 }] }),
    });

    await act(async () => {
      window.dispatchEvent(new Event('cartUpdated'));
    });

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});