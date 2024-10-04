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
    });
  
    afterEach(() => {
      jest.useRealTimers();
    });
  
    const renderReviews = (props = {}) => {
      return render(
        <UserContext.Provider value={{ user: mockUser }}>
          <Reviews restaurantID="123" onRatingChanged={() => {}} {...props} />
        </UserContext.Provider>
      );
    };
  
    test('renders Reviews component and fetches restaurant reviews', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReviews),
      });
  
      await act(async () => {
        renderReviews();
      });
  
      expect(screen.getByTestId('load-modal')).toBeInTheDocument();
  
      await act(async () => {
        jest.runAllTimers();
      });
  
      await waitFor(() => {
        expect(screen.queryByTestId('load-modal')).not.toBeInTheDocument();
      });
  
      expect(screen.getByText('Reviews')).toBeInTheDocument();
      expect(screen.getByText('Great food!')).toBeInTheDocument();
      expect(screen.getByText('Excellent service!')).toBeInTheDocument();
  
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/restaurant/123/restaurantReviews')
      );
    });
  
    test('renders Reviews component and fetches meal reviews', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReviews),
      });
  
      await act(async () => {
        renderReviews({ mealID: '456' });
      });
  
      await act(async () => {
        jest.runAllTimers();
      });
  
      await waitFor(() => {
        expect(screen.queryByTestId('load-modal')).not.toBeInTheDocument();
      });
  
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/restaurant/123/mealReviews/456')
      );
    });
  
    test('handles fetch error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));
      global.alert = jest.fn();
  
      await act(async () => {
        renderReviews();
      });
  
      await act(async () => {
        jest.runAllTimers();
      });
  
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to fetch reviews');
      });
    });
  
    test('opens AddReview popup when add button is clicked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReviews),
      });
  
      await act(async () => {
        renderReviews();
      });
  
      await act(async () => {
        jest.runAllTimers();
      });
  
      fireEvent.click(screen.getByText('add_box'));
  
      expect(screen.getByText('Review Restaurant')).toBeInTheDocument();
    });
  
    test('shows alert when trying to review without being logged in', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReviews),
      });
      global.alert = jest.fn();
  
      await act(async () => {
        render(
          <UserContext.Provider value={{ user: null }}>
            <Reviews restaurantID="123" onRatingChanged={() => {}} />
          </UserContext.Provider>
        );
      });
  
      await act(async () => {
        jest.runAllTimers();
      });
  
      fireEvent.click(screen.getByText('add_box'));
      expect(global.alert).toHaveBeenCalledWith('Please log in to leave a review');
    });
  
    test('handles review added successfully', async () => {
        const mockOnRatingChanged = jest.fn();
        global.fetch = jest.fn().mockImplementation((url) => {
          if (url.includes('/restaurantReviews')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockReviews),
            });
          }
          // Mock the response for adding a review
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Review added successfully' }),
          });
        });
    
        await act(async () => {
          render(
            <UserContext.Provider value={{ user: mockUser }}>
              <Reviews restaurantID="123" onRatingChanged={mockOnRatingChanged} />
            </UserContext.Provider>
          );
        });
    
        await act(async () => {
          jest.runAllTimers();
        });
    
        // Open the AddReview popup
        fireEvent.click(screen.getByText('add_box'));
    
        // Fill in the review form
        fireEvent.click(screen.getAllByText('star')[2]); // Select 3 stars
        fireEvent.change(screen.getByPlaceholderText('Enter a review'), {
          target: { value: 'Great experience!' },
        });
    
        // Submit the review
        await act(async () => {
          fireEvent.click(screen.getByText('Confirm'));
        });
    
        // Wait for the review to be added and the component to update
        await waitFor(() => {
          expect(mockOnRatingChanged).toHaveBeenCalled();
        });
    
        // Check that the AddReview popup is closed
        expect(screen.queryByText('Review Restaurant')).not.toBeInTheDocument();
    
        // Verify that the fetch function was called to add the review
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/restaurant/123/restaurantReview/'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': expect.any(String),
            }),
            body: JSON.stringify({ rating: 3, review: 'Great experience!' }),
          })
        );
      });
  
    test('renders no reviews message when there are no reviews', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });
  
      await act(async () => {
        renderReviews();
      });
  
      await act(async () => {
        jest.runAllTimers();
      });
  
      expect(screen.getByText('No Reviews.')).toBeInTheDocument();
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