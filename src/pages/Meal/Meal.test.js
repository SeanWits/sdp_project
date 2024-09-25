import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Meal from './Meal';
import { UserContext } from '../../utils/userContext';
import * as firestore from 'firebase/firestore';

// Mock the firebase module
jest.mock('../../firebase', () => ({
  db: {},
}));

// Mock the firestore module
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(x => x),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock Header and Footer components
jest.mock('../../components/Header/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/Footer/Footer', () => () => <div data-testid="mock-footer">Footer</div>);

const mockItem = {
  name: 'Test Item',
  description: 'Test description',
  price: 10.99,
  image_url: 'http://example.com/test.jpg',
  productID: 'testProduct'
};

const mockRestaurantData = {
  name: 'Test Restaurant',
  categories: [
    {
      menu_items: [mockItem]
    }
  ]
};

describe('Meal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useParams.mockReturnValue({ restaurantId: 'testRestaurant', itemName: 'Test%20Item' });
    require('react-router-dom').useLocation.mockReturnValue({ state: null });
    require('react-router-dom').useNavigate.mockReturnValue(jest.fn());
  });

  test('renders loading state initially', () => {
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockRestaurantData,
    });

    render(
      <Router>
        <UserContext.Provider value={{ user: null }}>
          <Meal />
        </UserContext.Provider>
      </Router>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders meal information after loading', async () => {
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockRestaurantData,
    });

    render(
      <Router>
        <UserContext.Provider value={{ user: null }}>
          <Meal />
        </UserContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Total: R10.99')).toBeInTheDocument();
      expect(screen.getByAltText('Test Item')).toHaveAttribute('src', 'http://example.com/test.jpg');
    });
  });

  test('handles add to cart for logged in user', async () => {
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockRestaurantData,
    });

    render(
      <Router>
        <UserContext.Provider value={{ user: { uid: 'testUser' } }}>
          <Meal />
        </UserContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Add to cart')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add to cart'));

    await waitFor(() => {
      expect(firestore.setDoc).toHaveBeenCalled();
    });
  });

  test('navigates to login when adding to cart without being logged in', async () => {
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockRestaurantData,
    });

    const mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

    render(
      <Router>
        <UserContext.Provider value={{ user: null }}>
          <Meal />
        </UserContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Add to cart')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add to cart'));

    expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything());
  });
});