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
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });
  });

  test('renders Orders component and fetches data', async () => {
    renderWithRouter(<Orders />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-load-modal')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByTestId('order-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('order-card-2')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/orders`,
      expect.objectContaining({
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      })
    );
  });

  test('updates order status', async () => {
    renderWithRouter(<Orders />);

    await waitFor(() => {
      const updateButton = screen.getAllByText('Update Status')[0];
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/orders/1/update-status`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newStatus: 'completed' })
        })
      );
    });
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

  test('renders back arrow', async () => {
    renderWithRouter(<Orders />);

    await waitFor(() => {
      const backLink = screen.getByText('←');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
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