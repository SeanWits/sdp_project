import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import Meal from './Meal';

window.dispatchEvent = jest.fn();

// Mock the dependencies
jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('../../components/LoadModal/LoadModal', () => ({ loading }) => (
  loading ? <div data-testid="mock-load-modal">Loading...</div> : null
));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

const renderWithRouter = (ui, { route = '/menu/123/burger', user = null } = {}) => {
  return render(
    <UserContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/menu/:restaurantId/:itemName" element={ui} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );
};

describe('Meal Component', () => {
  const mockItem = {
    name: 'Burger',
    description: 'Delicious burger',
    price: 10.99,
    image_url: 'burger.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ item: mockItem, restaurantName: 'Test Restaurant' }),
    });
  });

  test('renders Meal component and fetches data', async () => {
    renderWithRouter(<Meal />);

    // First, check for the loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the component to finish loading and render
    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });

    // Check for the meal details
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Delicious burger')).toBeInTheDocument();
      
      // Check for the total price
      const totalElement = screen.getByText((content, element) => {
        return element.id === 'total_text' && element.textContent.includes('Total') && element.textContent.includes('R10.99');
      });
      expect(totalElement).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/123/menu-item/burger')
    );
  });


  test('displays correct meal details', async () => {
    renderWithRouter(<Meal />);
  
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Delicious burger')).toBeInTheDocument();
      
      // Check for the total price
      const totalElement = screen.getByText((content, element) => {
        return element.id === 'total_text' && element.textContent.includes('Total') && element.textContent.includes('R10.99');
      });
      expect(totalElement).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Burger' })).toBeInTheDocument();
    });
  });

  test('adds item to cart for logged-in user', async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    };
  
    global.fetch.mockImplementation((url) => {
      if (url.includes('/restaurant/123/menu-item/burger')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            item: { 
              name: 'Burger', 
              description: 'Delicious burger', 
              price: 10.99,
              image_url: 'burger.jpg'
            },
            restaurantName: 'Test Restaurant'
          }),
        });
      }
      if (url.includes('/cart/add')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  
    window.alert = jest.fn();
  
    renderWithRouter(<Meal />, { user: mockUser });
  
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText('Add to cart'));
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/cart/add`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );
      expect(window.alert).toHaveBeenCalledWith('Item added to cart.');
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
    });
  });

  test('redirects to login for guest user', async () => {
    renderWithRouter(<Meal />);

    await waitFor(() => {
      const addToCartButton = screen.getByText('Add to cart');
      fireEvent.click(addToCartButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything());
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
    console.error = jest.fn();

    renderWithRouter(<Meal />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching item:', expect.any(Error));
      expect(screen.getByText('Error: Failed to load item data')).toBeInTheDocument();
    });
  });

  test('displays loading state', () => {
    renderWithRouter(<Meal />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders review button', async () => {
    renderWithRouter(<Meal />);

    await waitFor(() => {
      expect(screen.getByText('Click For Reviews')).toBeInTheDocument();
    });
  });

  test('navigates back to menu', async () => {
    renderWithRouter(<Meal />);

    await waitFor(() => {
      const backButton = screen.getByRole('link', { name: /arrow_back_ios_new/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute('href', '/menu/123');
    });
  });
});