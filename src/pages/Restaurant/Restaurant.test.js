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

const mockRestaurants = [
  {
    id: '1',
    name: 'Test Restaurant 1',
    location: 'Test Location 1',
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

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token')
};

// Wrapper component with router and context
const TestWrapper = ({ children }) => (
  <UserContext.Provider value={{ user: mockUser }}>
    <Router>
      {children}
    </Router>
  </UserContext.Provider>
);

describe('Restaurant Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock both restaurant and events fetch calls
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRestaurants),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
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

  test('displays restaurant details correctly', async () => {
    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });
  
    await waitFor(() => {
      // Check for restaurant 1 details
      expect(screen.getByText('Test Restaurant 1')).toBeInTheDocument();
      expect(screen.getByText(/Test Location 1/)).toBeInTheDocument();
      expect(screen.getByText(/9:00 AM - 10:00 PM/)).toBeInTheDocument();
      expect(screen.getByText(/4.5/)).toBeInTheDocument();
      
      // Check for restaurant 2 details
      expect(screen.getByText('Test Restaurant 2')).toBeInTheDocument();
      expect(screen.getByText(/Test Location 2/)).toBeInTheDocument();
      expect(screen.getByText(/8:00 AM - 11:00 PM/)).toBeInTheDocument();
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

  test('opens reservation modal when Reservation button is clicked', async () => {
    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });

    await waitFor(() => {
      const reservationButtons = screen.getAllByText(/Reservation/i);
      fireEvent.click(reservationButtons[0]);
    });

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByText(/Reservation for Test Restaurant 1/i)).toBeInTheDocument();
  });

  test('closes reservation modal when Close button is clicked', async () => {
    await act(async () => {
      render(<TestWrapper><Restaurant /></TestWrapper>);
    });

    await waitFor(() => {
      const reservationButtons = screen.getAllByText(/Reservation/i);
      fireEvent.click(reservationButtons[0]);
    });

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });
});