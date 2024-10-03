import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Reviews } from './Reviews';
import { AddReview } from './AddReview';
import { UserContext } from '../../utils/userContext';
import { auth } from '../../firebase';

// Mock the firebase auth
jest.mock('../../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'mock-user-id',
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
}));

// Mock the fetch function
global.fetch = jest.fn();

// Mock the LoadModal component
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => 
  loading ? <div data-testid="load-modal">Loading...</div> : null
);

describe('Reviews Component', () => {
  const mockUser = { uid: 'mock-user-id' };
  const mockReviews = [
    { rating: 4, dateCreated: { _seconds: 1625097600 }, review: 'Great food!' },
    { rating: 5, dateCreated: { _seconds: 1625184000 }, review: 'Excellent service!' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReviews),
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders Reviews component and fetches reviews', async () => {
    await act(async () => {
      render(
        <UserContext.Provider value={{ user: mockUser }}>
          <Reviews restaurantID="123" onRatingChanged={() => {}} />
        </UserContext.Provider>
      );
    });

    // Initially, the loading modal should be present
    expect(screen.getByTestId('load-modal')).toBeInTheDocument();

    // Wait for the loading to complete
    await act(async () => {
      jest.runAllTimers();
    });

    // Now the loading modal should not be in the document
    await waitFor(() => {
      expect(screen.queryByTestId('load-modal')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Reviews')).toBeInTheDocument();
    
    // Wait for the reviews to be rendered
    await waitFor(() => {
      expect(screen.getByText('Great food!')).toBeInTheDocument();
      expect(screen.getByText('Excellent service!')).toBeInTheDocument();
    });
  });

  test('opens AddReview popup when add button is clicked', async () => {
    await act(async () => {
      render(
        <UserContext.Provider value={{ user: mockUser }}>
          <Reviews restaurantID="123" onRatingChanged={() => {}} />
        </UserContext.Provider>
      );
    });

    fireEvent.click(screen.getByText('add_box'));
    expect(screen.getByText('Review Restaurant')).toBeInTheDocument();
  });

  test('shows alert when trying to review without being logged in', async () => {
    global.alert = jest.fn();

    await act(async () => {
      render(
        <UserContext.Provider value={{ user: null }}>
          <Reviews restaurantID="123" onRatingChanged={() => {}} />
        </UserContext.Provider>
      );
    });

    fireEvent.click(screen.getByText('add_box'));
    expect(global.alert).toHaveBeenCalledWith('Please log in to leave a review');
  });
});

describe('AddReview Component', () => {
    const mockOnReviewAdded = jest.fn();
    const mockUser = { uid: 'mock-user-id' };
  
    beforeEach(() => {
      jest.clearAllMocks();
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Review added successfully' }),
        })
      );
    });
  
    const renderAddReview = (props = {}) => {
      return render(
        <UserContext.Provider value={{ user: mockUser }}>
          <AddReview restaurantID="123" onReviewAdded={mockOnReviewAdded} {...props} />
        </UserContext.Provider>
      );
    };

    test('renders AddReview component', () => {
        renderAddReview();
        expect(screen.getByText('Review Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Rating')).toBeInTheDocument();
        expect(screen.getByText('Review')).toBeInTheDocument();
      });

      test('submits a review successfully', async () => {
        global.alert = jest.fn();
    
        renderAddReview();
    
        fireEvent.click(screen.getAllByText('star')[2]); // Select 3 stars
        fireEvent.change(screen.getByPlaceholderText('Enter a review'), { target: { value: 'Great experience!' } });
        
        await act(async () => {
          fireEvent.click(screen.getByText('Confirm'));
        });
    
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/restaurant/123/restaurantReview/mock-user-id'),
            expect.objectContaining({
              method: 'PUT',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock-token'
              }),
              body: JSON.stringify({ rating: 3, review: 'Great experience!' })
            })
          );
        });
    
        expect(global.alert).toHaveBeenCalledWith('Review added successfully');
        expect(mockOnReviewAdded).toHaveBeenCalled();
      });

      test('shows alert when trying to submit without rating', async () => {
        global.alert = jest.fn();
    
        renderAddReview();
    
        await act(async () => {
          fireEvent.click(screen.getByText('Confirm'));
        });
    
        expect(global.alert).toHaveBeenCalledWith('Please select a rating');
        expect(global.fetch).not.toHaveBeenCalled();
      });
    

      test('handles API error when submitting review', async () => {
        global.alert = jest.fn();
        global.fetch.mockImplementationOnce(() => 
          Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'API Error' }),
          })
        );
    
        renderAddReview();
    
        fireEvent.click(screen.getAllByText('star')[2]); // Select 3 stars
        fireEvent.change(screen.getByPlaceholderText('Enter a review'), { target: { value: 'Great experience!' } });
        
        await act(async () => {
          fireEvent.click(screen.getByText('Confirm'));
        });
    
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Failed to add review. Please try again.');
        });
      });
});