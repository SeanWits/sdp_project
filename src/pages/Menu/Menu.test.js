import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Menu from './Menu';

// Mock components before any imports
jest.mock('../../components/Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

jest.mock('../../components/Footer/Footer', () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">Footer</div>;
  };
});

jest.mock('../../components/LoadModal/LoadModal', () => {
  return function MockLoadModal({ loading }) {
    if (loading) {
      return <div data-testid="loader" className="load-modal">Loading...</div>;
    }
    return null;
  };
});

// Mock NavBar without using Link directly
jest.mock('../../components/NavBar/NavBar', () => ({
  NavBar: function MockNavBar({ Heading }) {
    return (
      <header className="menuHeader grid">
        <h2 className="nav-heading">{Heading}</h2>
        <a href="/" className="back-link">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </a>
      </header>
    );
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ restaurantId: '123' }),
    useLocation: () => ({ state: { restaurant: null } }),
    useNavigate: () => mockNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>
  };
});

const mockRestaurant = {
  name: 'Test Restaurant',
  categories: [
    {
      name: 'Appetizers',
      description: 'Delicious starters',
      menu_items: [
        { name: 'Nachos', description: 'Cheesy nachos', price: 9.99, is_available: true, image_url: 'nachos.jpg' },
        { name: 'Wings', description: 'Spicy wings', price: 12.99, is_available: true, image_url: 'wings.jpg' },
      ],
    },
    {
      name: 'Main Course',
      description: 'Hearty meals',
      menu_items: [
        { name: 'Burger', description: 'Juicy burger', price: 14.99, is_available: true, image_url: 'burger.jpg' },
        { name: 'Pizza', description: 'Pepperoni pizza', price: 16.99, is_available: false, image_url: 'pizza.jpg' },
      ],
    },
  ],
};

describe('Menu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRestaurant),
    });
  });

  test('renders Menu component and fetches data', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
  
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Appetizers')).toBeInTheDocument();
      expect(screen.getByText('Main Course')).toBeInTheDocument();
    });
  
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/restaurant/123`
    );
  });

  test('displays menu items for the selected category', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Nachos')).toBeInTheDocument();
      expect(screen.getByText('Wings')).toBeInTheDocument();
      expect(screen.queryByText('Burger')).not.toBeInTheDocument();
    });
  });

  test('changes category when clicked', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );

    await waitFor(() => {
      const mainCourseButton = screen.getByText('Main Course');
      fireEvent.click(mainCourseButton);
    });

    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Nachos')).not.toBeInTheDocument();
  });

  test('displays item availability', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
  
    await waitFor(() => {
      fireEvent.click(screen.getByText('Main Course'));
    });
  
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  test('renders item images', async () => {
    render(
      <Router>
        <Menu />
      </Router>
    );

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'nachos.jpg');
      expect(images[1]).toHaveAttribute('src', 'wings.jpg');
    });
  });

  test('handles fetch error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <Router>
        <Menu />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  test('handles no menu categories', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockRestaurant, categories: [] }),
    });

    render(
      <Router>
        <Menu />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('No menu categories available')).toBeInTheDocument();
    });
  });

  test('displays loading state', () => {
    render(
      <Router>
        <Menu />
      </Router>
    );
    
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});