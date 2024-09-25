import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import MenuInfo from './MenuInfo';
import { getDoc } from 'firebase/firestore';

jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-restaurant-id' }),
  useLocation: () => ({ state: null }),
}));

const mockRestaurantData = {
  id: 'test-restaurant-id',
  name: 'Test Restaurant',
  location: 'Test Location',
  opening_time: '9:00 AM',
  closing_time: '10:00 PM',
  contact_details: '123-456-7890',
  telephone: '098-765-4321',
  email: 'test@restaurant.com',
  rating: '4.5',
  restImg: 'http://example.com/restaurant.jpg'
};

const renderWithRouter = (ui, { route = '/menu-info/test-restaurant-id' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: Router });
};

describe('MenuInfo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockRestaurantData,
      id: 'test-restaurant-id',
    });
  });

  test('renders loading state initially', () => {
    renderWithRouter(<MenuInfo />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders restaurant information after loading', async () => {
    renderWithRouter(<MenuInfo />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Name: Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Location: Test Location')).toBeInTheDocument();
      expect(screen.getByText('Operating Hours: 9:00 AM - 10:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Contact details: 123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('Telephone: 098-765-4321')).toBeInTheDocument();
      expect(screen.getByText('Email: test@restaurant.com')).toBeInTheDocument();
      expect(screen.getByText('Rating: 4.5')).toBeInTheDocument();
      expect(screen.getByAltText('Test Restaurant')).toBeInTheDocument();
    });
  });

  test('renders error message when restaurant is not found', async () => {
    getDoc.mockResolvedValue({
      exists: () => false,
    });

    renderWithRouter(<MenuInfo />);

    await waitFor(() => {
      expect(screen.getByText('Error: Restaurant not found')).toBeInTheDocument();
    });
  });

  test('renders error message when there is a problem fetching data', async () => {
    getDoc.mockRejectedValue(new Error('Fetch error'));

    renderWithRouter(<MenuInfo />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
    });
  });

  test('renders back arrow link', async () => {
    renderWithRouter(<MenuInfo />);

    await waitFor(() => {
      const backArrow = screen.getByText('←');
      expect(backArrow).toBeInTheDocument();
      expect(backArrow.closest('a')).toHaveAttribute('href', '/');
    });
  });

  test('renders "Click For Review" button', async () => {
    renderWithRouter(<MenuInfo />);

    await waitFor(() => {
      expect(screen.getByText('Click For Review')).toBeInTheDocument();
    });
  });

  test('applies correct styles to key elements', async () => {
    renderWithRouter(<MenuInfo />);

    await waitFor(() => {
      const nameRes = screen.getByText('Name: Test Restaurant').closest('#nameRes');
      expect(nameRes).toHaveStyle({
        backgroundColor: '#FCB040',
        height: '290px',
        width: '760px',
        marginTop: '25px',
        marginBottom: '25px',
      });

      const resDeets = screen.getByText('Restaurant Details').closest('.resDeets');
      expect(resDeets).toHaveStyle({
        marginTop: '20px',
        marginBottom: '20px',
      });

      const menuInfoButton = screen.getByText('Click For Review');
      expect(menuInfoButton).toHaveStyle({
        marginLeft: '45%',
      });

      const backArrow = screen.getByText('←');
      expect(backArrow).toHaveStyle({
        position: 'absolute',
        left: '10px',
        color: 'white',
        textDecoration: 'none',
        fontSize: '24px',
      });

      const menuHeader = screen.getByText('Test Restaurant').closest('.menuHeader');
      expect(menuHeader).toHaveStyle({
        position: 'relative',
      });
    });
  });
});