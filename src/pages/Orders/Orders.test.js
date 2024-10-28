import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import Orders from './Orders';

// Mock the modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);
jest.mock('../../components/OrderCard/OrderCard', () => ({ order, onStatusUpdate }) => (
  <div data-testid={`order-card-${order.id}`}>
    {order.id} - {order.status}
    <button onClick={() => onStatusUpdate(order.id, 'completed')}>Update Status</button>
  </div>
));

// Mock fetch
global.fetch = jest.fn();

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

const mockOrders = [
  { id: '1', status: 'pending' },
  { id: '2', status: 'completed' },
];

const renderWithRouter = (ui, { route = '/orders', user = mockUser } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <UserContext.Provider value={{ user }}>
      <Router>{ui}</Router>
    </UserContext.Provider>
  );
};

describe('Orders Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a more specific mock implementation for fetch
    global.fetch = jest.fn((url) => {
      if (url.includes('/orders/')) {
        if (url.includes('/update-status')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'success' })
          });
        }
      }
      // Default handler for fetching orders list
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrders)
      });
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    renderWithRouter(<Orders />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load orders. Please try again.')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('redirects to login if user is not authenticated', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderWithRouter(<Orders />, { user: null });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('renders back navigation', async () => {
    renderWithRouter(<Orders />);

    await waitFor(() => {
      const backNavigation = screen.getByRole('link', { class: 'back-arrow' });
      expect(backNavigation).toBeInTheDocument();
      expect(backNavigation).toHaveAttribute('href', '/');
      expect(backNavigation.querySelector('.material-symbols-outlined')).toHaveTextContent('arrow_back_ios_new');
    });
  });

  test('handles order status update error', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrders),
      })
      .mockRejectedValueOnce(new Error('Update failed'));

    console.error = jest.fn();

    renderWithRouter(<Orders />);

    await waitFor(() => {
      const updateButton = screen.getAllByText('Update Status')[0];
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error updating order status:", expect.any(Error));
      expect(screen.getByText('Error: Failed to update order status. Please try again.')).toBeInTheDocument();
    });
  });
});