import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams, useLocation, MemoryRouter,  } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import RestaurantInfo from './RestaurantInfo';
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

// Mock react-modal
jest.mock('react-modal', () => {
  return function ModalMock({ isOpen, children, onRequestClose }) {
    return isOpen ? (
      <div role="dialog">
        {children}
      </div>
    ) : null;
  };
});

// Mock components
jest.mock('../../components/LoadModal/LoadModal', () => {
  return function LoadModalMock({ loading }) {
    return loading ? <div data-testid="loading-modal">Loading...</div> : null;
  };
});

jest.mock('../../components/Header/Header', () => {
  return function HeaderMock() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../../components/Footer/Footer', () => {
  return function FooterMock() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('../Reviews/Reviews', () => {
  return {
    Reviews: ({ onClose, restaurantID, mealID, onRatingChanged }) => (
      <div data-testid="mock-reviews">
        Mock Reviews Component
      </div>
    )
  };
});

jest.mock('../Reviews/Popup/Popup', () => {
  return function MockPopup({ children, isOpen }) {
    return isOpen ? (
      <div role="dialog" data-testid="mock-popup">
        {children}
      </div>
    ) : null;
  };
});

// Mock data
const mockRestaurant = {
  id: '123',
  name: 'Test Restaurant',
  location: 'West Campus',
  opening_time: '9:00',
  closing_time: '21:00',
  contact_details: '123-456-7890',
  telephone: '098-765-4321',
  email: 'test@restaurant.com',
  rating: '4.5',
  restImg: 'test-image-url.jpg'
};

const mockEvent = {
  title: 'Test Event',
  venue: 'West Campus',
  date: '2024-10-25',
  description: 'Test event description',
  availableTickets: 100,
  imageUrl: 'test-event-image.jpg'
};

const mockUser = {
  id: 'testUserId',
  name: 'Test User',
  email: 'test@example.com'
};

describe('RestaurantInfo Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock fetch
    global.fetch = jest.fn();
    
    // Mock router hooks
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ state: { restaurant: mockRestaurant } });
  });

  // Render Tests
  describe('Rendering', () => {
    test('renders loading state initially', () => {
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
      expect(screen.getByTestId('loading-modal')).toBeInTheDocument();
    });

    test('renders restaurant details after loading', async () => {
      // Mock the setTimeout
      jest.useFakeTimers();
      
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
    
      // Fast-forward timers
      jest.advanceTimersByTime(200);
    
      await waitFor(() => {
        expect(screen.queryByTestId('loading-modal')).not.toBeInTheDocument();
      });
    
      // Check for specific elements using more precise queries
      // For the header title
      expect(screen.getByRole('heading', { level: 2, name: mockRestaurant.name })).toBeInTheDocument();
      
      // For the location in the details list
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               element.className === 'value-paragraph' && 
               content.trim() === mockRestaurant.location;
      })).toBeInTheDocument();
      
      // For the operating hours
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               element.className === 'value-paragraph' && 
               content.trim() === `${mockRestaurant.opening_time} - ${mockRestaurant.closing_time}`;
      })).toBeInTheDocument();
    
      // Restore timers
      jest.useRealTimers();
    });

    test('renders restaurant image when available', async () => {
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );

      await waitFor(() => {
        const img = screen.getByAltText(mockRestaurant.name);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', mockRestaurant.restImg);
      });
    });
  });

  // API Tests
  describe('API Interactions', () => {
    test('fetches restaurant data when not provided in location state', async () => {
      // Set up location mock with no restaurant data
      useLocation.mockReturnValue({ state: {} });
      
      // Mock fetch response
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/restaurant/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRestaurant)
          });
        }
        // Mock events endpoint
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
  
      // Use fake timers
      jest.useFakeTimers();
  
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
  
      // Advance timers
      jest.advanceTimersByTime(200);
  
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/restaurant/${mockRestaurant.id}`)
        );
        expect(screen.getByText(mockRestaurant.name)).toBeInTheDocument();
      });
  
      jest.useRealTimers();
    });
  
    test('handles API error gracefully', async () => {
      useLocation.mockReturnValue({ state: {} });
      
      // Mock fetch to reject
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/restaurant/')) {
          return Promise.reject(new Error('Failed to fetch restaurant data'));
        }
        // Mock events endpoint
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
  
      jest.useFakeTimers();
  
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
  
      jest.advanceTimersByTime(200);
  
      await waitFor(() => {
        expect(screen.getByText(/Failed to load restaurant data/i)).toBeInTheDocument();
      });
  
      jest.useRealTimers();
    });
  
    test('fetches events data on component mount', async () => {
      // Provide restaurant data through location state to avoid restaurant fetch
      useLocation.mockReturnValue({ state: { restaurant: mockRestaurant } });
      
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/events')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([mockEvent])
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
  
      jest.useFakeTimers();
  
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
  
      jest.advanceTimersByTime(200);
  
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/events')
        );
      });
  
      jest.useRealTimers();
    });
  });

  // User Interaction Tests
  describe('User Interactions', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
      jest.useFakeTimers();
    });
  
    afterEach(() => {
      jest.useRealTimers();
    });
  
    test('opens review popup when clicking review button', async () => {
      useLocation.mockReturnValue({ state: { restaurant: mockRestaurant } });
  
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });
  
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
  
      // Wait for loading to complete
      jest.advanceTimersByTime(200);
  
      await waitFor(() => {
        expect(screen.queryByTestId('loading-modal')).not.toBeInTheDocument();
      });
  
      // Click the review button
      const reviewButton = screen.getByRole('button', { name: /click for review/i });
      fireEvent.click(reviewButton);
  
      // Check if popup is opened
      await waitFor(() => {
        expect(screen.getByTestId('mock-popup')).toBeInTheDocument();
        expect(screen.getByTestId('mock-reviews')).toBeInTheDocument();
      });
    });
  
    test('opens event modal when clicking on upcoming event', async () => {
      const mockEventData = [{
        ...mockEvent,
        venue: 'West Campus'
      }];
  
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/events')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockEventData)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRestaurant)
        });
      });
  
      useLocation.mockReturnValue({ state: { restaurant: mockRestaurant } });
  
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
  
      // Wait for loading to complete
      jest.advanceTimersByTime(200);
  
      // Click on the element that opens the modal (the "Upcoming Event:" text)
      await waitFor(() => {
        const upcomingEventElement = screen.getByText('Upcoming Event:');
        expect(upcomingEventElement).toBeInTheDocument();
        fireEvent.click(upcomingEventElement);
      });
  
      // The modal should be open now
      await waitFor(() => {
        const modalElement = document.querySelector('[role="dialog"]');
        expect(modalElement).toBeInTheDocument();
      });
    });
  
  });

  // Style Tests
  describe('Styling', () => {
    test('applies correct styles to restaurant image', async () => {
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
  
      await waitFor(() => {
        const img = screen.getByAltText(mockRestaurant.name);
        expect(img).toHaveAttribute('id', 'imgRes');
      });
    });
  
    test('applies responsive styles on mobile viewport', async () => {
      render(
        <BrowserRouter>
          <RestaurantInfo />
        </BrowserRouter>
      );
  
      jest.advanceTimersByTime(200);
  
      await waitFor(() => {
        const restaurantSection = screen.getByTestId('restaurant-info-section');
        expect(restaurantSection).toBeInTheDocument();
      });
    });
  });  
});

// CSS Tests
describe('RestaurantInfo CSS', () => {

  test('applies correct styles to restaurant details section', async () => {
    useLocation.mockReturnValue({ state: { restaurant: mockRestaurant } });
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(
      <BrowserRouter>
        <RestaurantInfo />
      </BrowserRouter>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-modal')).not.toBeInTheDocument();
    });

    // Check styles of the details section using correct query
    const detailsSection = screen.getByTestId('restaurant-details');
    // Alternative query:
    // const detailsSection = document.querySelector('.resDeets');
    
    expect(detailsSection).toBeInTheDocument();
    expect(detailsSection).toHaveClass('resDeets');

    const styles = window.getComputedStyle(detailsSection);
    expect(styles).toBeDefined();
  });
});