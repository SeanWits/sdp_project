import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import Restaurant from './Restaurant';

// Mock react-modal
jest.mock('react-modal', () => {
  const Modal = ({ children, isOpen, onRequestClose }) => (
    isOpen ? <div data-testid="mock-modal">{children}</div> : null
  );
  Modal.setAppElement = jest.fn();
  return Modal;
});

// Mock CSS and components
jest.mock('./Restaurant.css', () => ({}));
jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
);
jest.mock('../Reservation/ReservationPage/ReservationPage', () => ({ restaurant, onClose }) => (
  <div data-testid="mock-reservation-page">
    Reservation for {restaurant.name}
    <button onClick={onClose}>Close</button>
  </div>
));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockRestaurants = [
  {
    id: '1',
    name: 'Test Restaurant 1',
    location: 'West Campus Location 1',
    opening_time: '9:00 AM',
    closing_time: '10:00 PM',
    rating: 4.5,
    restImg: 'test-image-1.jpg',
    prefs: ['Halaal', 'Vegan']
  },
  {
    id: '2',
    name: 'Test Restaurant 2',
    location: 'Test Location 2',
    opening_time: '8:00 AM',
    closing_time: '11:00 PM',
    rating: null,
    restImg: null,
    prefs: ['Vegetarian']
  }
];

const mockEvents = [
  {
    id: 1,
    title: 'Test Event',
    venue: 'West Campus',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    description: 'Test Description',
    imageUrl: 'test-image.jpg',
    availableTickets: 100
  }
];

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token')
};

// Wrapper component with router and context
const TestWrapper = ({ children, user = mockUser }) => (
  <UserContext.Provider value={{ user }}>
    <Router>
      {children}
    </Router>
  </UserContext.Provider>
);

describe('Restaurant Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset fetch mock for each test
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRestaurants),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hasActiveReservation: false }),
      }));
  });

  test('renders Restaurant component and fetches data', async () => {
    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant 1')).toBeInTheDocument();
      expect(screen.getByText('Test Restaurant 2')).toBeInTheDocument();
    });
  });

  test('handles missing rating and image', async () => {
    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });
  
    await waitFor(() => {
      const noRatingElements = screen.getAllByText(/No Rating/);
      expect(noRatingElements).toHaveLength(1); // Only restaurant 2 has no rating
    });
  });
  
  test('renders navigation buttons for each restaurant', async () => {
    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });

    await waitFor(() => {
      // Each restaurant should have Menu, Reservation, and More Info buttons
      const menuButtons = screen.getAllByText(/Menu/i);
      const reservationButtons = screen.getAllByText(/Reservation/i);
      const moreInfoButtons = screen.getAllByText(/More Info/i);

      expect(menuButtons).toHaveLength(mockRestaurants.length);
      expect(reservationButtons).toHaveLength(mockRestaurants.length);
      expect(moreInfoButtons).toHaveLength(mockRestaurants.length);
    });
  });


  test('shows loading state', async () => {
    render(<TestWrapper><Restaurant /></TestWrapper>);

    expect(screen.getByTestId('mock-load-modal')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('mock-load-modal')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('handles no user logged in', async () => {
    await act(async () => {
      render(<TestWrapper user={null}><Restaurant /></TestWrapper>);
    });

    await waitFor(() => {
      const reservationButton = screen.getAllByText(/Reservation/i)[0];
      fireEvent.click(reservationButton);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('handles API error', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('API Error')));

    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
    });
  });

  test('handles restaurant API error response', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 500
    }));

    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
    });
  });

  test('handles active reservation check error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRestaurants),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      }))
      .mockImplementationOnce(() => Promise.reject(new Error('Active reservation check failed')));

    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error checking active reservations: ',
        expect.any(Error)
      );
      expect(alertMock).toHaveBeenCalledWith('Failed to check active reservations. Please try again.');
    });

    consoleSpy.mockRestore();
    alertMock.mockRestore();
  });
});