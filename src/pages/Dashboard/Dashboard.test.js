import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import Dashboard from './Dashboard';
import { logoutUser } from '../../utils/authFunctions';

jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('../../utils/authFunctions', () => ({
  logoutUser: jest.fn(),
}));

global.fetch = jest.fn();

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

const mockUserData = {
  name: 'John Doe',
  wallet: 100,
};

const mockTransactions = [
  { id: 1, restaurantDetails: { name: 'Restaurant A' }, totalAmount: 25 },
  { id: 2, restaurantDetails: { name: 'Restaurant B' }, totalAmount: 30 },
];

const renderWithContext = (ui, { user = mockUser, setUser = jest.fn() } = {}) => {
  return render(
    <UserContext.Provider value={{ user, setUser }}>
      <Router>{ui}</Router>
    </UserContext.Provider>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockImplementation((url) => {
      if (url.includes('/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData),
        });
      }
      if (url.includes('/orders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTransactions),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders Dashboard component and fetches data', async () => {
    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByText('Meal Credit Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByText('R100.00')).toBeInTheDocument();
    expect(screen.getByText('Restaurant A')).toBeInTheDocument();
    expect(screen.getByText('Restaurant B')).toBeInTheDocument();
  });

  test('handles view transaction history', async () => {
    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    fireEvent.click(screen.getByText('View Transaction History'));
    expect(mockNavigate).toHaveBeenCalledWith('/orders');
  });

  test('handles add to wallet successfully', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }));

    global.alert = jest.fn();

    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    fireEvent.change(screen.getByPlaceholderText('Enter amount'), { target: { value: '50' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Add to Wallet'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/user/update-wallet`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ amount: 50 }),
      })
    );

    expect(global.alert).toHaveBeenCalledWith('Wallet updated successfully!');
    expect(screen.getByText('R150.00')).toBeInTheDocument();
  });

  test('handles add to wallet failure', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid amount' }),
    }));

    global.alert = jest.fn();
    console.error = jest.fn();

    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    fireEvent.change(screen.getByPlaceholderText('Enter amount'), { target: { value: '-50' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Add to Wallet'));
    });

    expect(console.error).toHaveBeenCalledWith("Error updating wallet:", expect.any(Error));
    expect(global.alert).toHaveBeenCalledWith('Failed to update wallet. Please try again.');
  });

  test('handles logout', async () => {
    const mockSetUser = jest.fn();
    await act(async () => {
      renderWithContext(<Dashboard />, { setUser: mockSetUser });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Log Out'));
    });

    expect(logoutUser).toHaveBeenCalled();
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redirects to login if user is not authenticated', async () => {
    await act(async () => {
      renderWithContext(<Dashboard />, { user: null });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles fetch error for user data', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch user data'));
    console.error = jest.fn();

    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching user data:', expect.any(Error));
  });

  test('handles fetch error for recent transactions', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData),
      })
      .mockRejectedValueOnce(new Error('Failed to fetch recent transactions'));
    console.error = jest.fn();

    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching recent transactions:', expect.any(Error));
  });

  test('handles empty wallet amount', async () => {
    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    fireEvent.click(screen.getByText('Add to Wallet'));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('handles unknown restaurant in transactions', async () => {
    const mockTransactionsWithUnknown = [
      { id: 1, totalAmount: 25 }, // No restaurantDetails
    ];

    global.fetch.mockImplementation((url) => {
      if (url.includes('/orders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTransactionsWithUnknown),
        });
      }
      return global.fetch(url);
    });

    await act(async () => {
      renderWithContext(<Dashboard />);
    });

    expect(screen.getByText('Unknown Restaurant')).toBeInTheDocument();
  });
});