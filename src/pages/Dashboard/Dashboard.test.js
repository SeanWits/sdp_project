import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './Dashboard';
import { UserContext } from '../../utils/userContext';
import * as firestore from 'firebase/firestore';
import { logoutUser } from '../../utils/authFunctions';

jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../utils/authFunctions', () => ({
  logoutUser: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);

describe('Dashboard Component', () => {
  const mockUser = { uid: 'testUser' };
  const mockUserData = { name: 'Test User', wallet: 100 };
  const mockTransactions = [
    { id: '1', restaurantId: 'rest1', totalAmount: 25, createdAt: { toDate: () => new Date() } },
    { id: '2', restaurantId: 'rest2', totalAmount: 30, createdAt: { toDate: () => new Date() } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    firestore.getDoc.mockResolvedValue({ exists: () => true, data: () => mockUserData });
    firestore.getDocs.mockResolvedValue({ docs: mockTransactions.map(t => ({ id: t.id, data: () => t })) });
  });

  const renderDashboard = (user = mockUser) => {
    return render(
      <Router>
        <UserContext.Provider value={{ user, setUser: jest.fn() }}>
          <Dashboard />
        </UserContext.Provider>
      </Router>
    );
  };

  test('fetches and displays user data', async () => {
    await act(async () => {
      renderDashboard();
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
      expect(screen.getByText('R100.00')).toBeInTheDocument();
    });
  });

  test('fetches and displays recent transactions', async () => {
    await act(async () => {
      renderDashboard();
    });

    await waitFor(() => {
      expect(screen.getByText('-R25.00')).toBeInTheDocument();
      expect(screen.getByText('-R30.00')).toBeInTheDocument();
    });
  });

  test('handles view transaction history', async () => {
    await act(async () => {
      renderDashboard();
    });

    fireEvent.click(screen.getByText('View Transaction History'));
    expect(mockNavigate).toHaveBeenCalledWith('/orders');
  });

  test('handles add to wallet', async () => {
    await act(async () => {
      renderDashboard();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter amount'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Add to Wallet'));

    await waitFor(() => {
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ wallet: 150 })
      );
    });
  });

  test('handles logout', async () => {
    await act(async () => {
      renderDashboard();
    });

    fireEvent.click(screen.getByText('Log Out'));

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('redirects to login if no user', async () => {
    await act(async () => {
      renderDashboard(null);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles error when fetching user data', async () => {
    firestore.getDoc.mockRejectedValueOnce(new Error('Fetch error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      renderDashboard();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles error when fetching transactions', async () => {
    firestore.getDocs.mockRejectedValueOnce(new Error('Fetch error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      renderDashboard();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching recent transactions:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles error when adding to wallet', async () => {
    firestore.updateDoc.mockRejectedValueOnce(new Error('Update error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await act(async () => {
      renderDashboard();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter amount'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Add to Wallet'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating wallet:', expect.any(Error));
      expect(alertMock).toHaveBeenCalledWith('Failed to update wallet. Please try again.');
    });

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });

  test('handles error during logout', async () => {
    logoutUser.mockRejectedValueOnce(new Error('Logout error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await act(async () => {
      renderDashboard();
    });

    fireEvent.click(screen.getByText('Log Out'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error logging out:', expect.any(Error));
      expect(alertMock).toHaveBeenCalledWith('Failed to log out. Please try again.');
    });

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });
});
