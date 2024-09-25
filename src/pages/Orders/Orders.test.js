import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Orders from './Orders';
import { UserContext } from '../../utils/userContext';
import { collection, query, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../components/Header/Header', () => ({ disableCart, disableOrders }) => (
  <div data-testid="mock-header">Header {disableCart ? 'Cart Disabled' : ''} {disableOrders ? 'Orders Disabled' : ''}</div>
));
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/OrderCard/OrderCard', () => ({ order, onStatusUpdate }) => (
  <div data-testid="mock-order-card">
    {order.id} - {order.status} - {order.restaurantDetails.name}
    <button onClick={() => onStatusUpdate(order.id, 'completed')}>Update Status</button>
  </div>
));

const mockOrders = [
  {
    id: 'order1',
    userId: 'user1',
    restaurantId: 'rest1',
    status: 'pending',
    createdAt: { toDate: () => new Date('2023-01-01') },
    updatedAt: { toDate: () => new Date('2023-01-01') },
  },
  {
    id: 'order2',
    userId: 'user1',
    restaurantId: 'rest2',
    status: 'completed',
    createdAt: { toDate: () => new Date('2023-01-02') },
    updatedAt: { toDate: () => new Date('2023-01-02') },
  },
];

const mockRestaurants = {
  rest1: { name: 'Restaurant 1' },
  rest2: { name: 'Restaurant 2' },
};

const renderWithRouter = (ui, { route = '/orders' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: Router });
};

describe('Orders Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDocs.mockResolvedValue({
      docs: mockOrders.map(order => ({
        id: order.id,
        data: () => order,
      })),
    });
    getDoc.mockImplementation((docRef) => {
      const restaurantId = docRef.id;
      return Promise.resolve({
        exists: () => true,
        data: () => mockRestaurants[restaurantId],
      });
    });
  });

  test('renders loading state initially', () => {
    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders orders after loading', async () => {
    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getAllByTestId('mock-order-card')).toHaveLength(2);
      expect(screen.getByText('order1 - pending - Restaurant 1')).toBeInTheDocument();
      expect(screen.getByText('order2 - completed - Restaurant 2')).toBeInTheDocument();
    });
  });

  test('renders error message when there is a problem fetching orders', async () => {
    getDocs.mockRejectedValue(new Error('Fetch error'));

    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load orders. Please try again.')).toBeInTheDocument();
    });
  });

  test('renders error message when there is a problem fetching restaurant details', async () => {
    getDoc.mockRejectedValue(new Error('Fetch error'));

    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load orders. Please try again.')).toBeInTheDocument();
    });
  });

  test('updates order status when update button is clicked', async () => {
    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('mock-order-card')).toHaveLength(2);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByText('Update Status')[0]);
    });

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { status: 'completed' });
    });
  });

  test('handles error when updating order status', async () => {
    updateDoc.mockRejectedValue(new Error('Update error'));

    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('mock-order-card')).toHaveLength(2);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByText('Update Status')[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to update order status. Please try again.')).toBeInTheDocument();
    });
  });

  test('renders Header with correct props', async () => {
    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Header Cart Disabled Orders Disabled')).toBeInTheDocument();
    });
  });

  test('renders Footer component', async () => {
    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });

  test('renders back arrow link with correct href', async () => {
    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      const backArrow = screen.getByText('←');
      expect(backArrow).toBeInTheDocument();
      expect(backArrow.closest('a')).toHaveAttribute('href', '/');
      expect(backArrow.closest('a')).toHaveClass('back-arrow-orders');
    });
  });

  test('does not fetch orders when user is not logged in', async () => {
    renderWithRouter(
      <UserContext.Provider value={{ user: null }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(getDocs).not.toHaveBeenCalled();
    });
  });

  test('renders empty state when there are no orders', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('mock-order-card')).not.toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });
  });

  test('handles case when restaurant does not exist', async () => {
    getDoc.mockResolvedValue({
      exists: () => false,
    });

    renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('mock-order-card')).toHaveLength(2);
      expect(screen.getByText('order1 - pending - ')).toBeInTheDocument();
      expect(screen.getByText('order2 - completed - ')).toBeInTheDocument();
    });
  });

  test('fetches orders when user changes', async () => {
    const { rerender } = renderWithRouter(
      <UserContext.Provider value={{ user: { uid: 'user1' } }}>
        <Orders />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('mock-order-card')).toHaveLength(2);
    });

    getDocs.mockClear();

    rerender(
      <Router>
        <UserContext.Provider value={{ user: { uid: 'user2' } }}>
          <Orders />
        </UserContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getDocs).toHaveBeenCalledTimes(1);
    });
  });
});