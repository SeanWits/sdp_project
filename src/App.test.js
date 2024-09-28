import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock the UserProvider
jest.mock('./utils/userContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
}));

// Mock all the page components
jest.mock('./pages/Restaurant/Restaurant', () => () => <div>Restaurant Page</div>);
jest.mock('./pages/Login/Login', () => () => <div>Login Page</div>);
jest.mock('./pages/Register/Register', () => () => <div>Register Page</div>);
jest.mock('./pages/Checkout/Checkout', () => () => <div>Checkout Page</div>);
jest.mock('./pages/Orders/Orders', () => () => <div>Orders Page</div>);
jest.mock('./pages/Admin/Admin', () => () => <div>Admin Page</div>);
jest.mock('./pages/Dashboard/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('./pages/Menu/Menu', () => () => <div>Menu Page</div>);
jest.mock('./pages/Meal/Meal', () => () => <div>Meal Page</div>);
jest.mock('./pages/RestaurantInfo/RestaurantInfo', () => () => <div>Restaurant Info Page</div>);
jest.mock('./pages/Reservation/ReservationPage/ReservationPage', () => () => <div>Reservation Page</div>);
jest.mock('./pages/Reservation/OrderSummaryPage/OrderSummaryPage', () => () => <div>Order Summary Page</div>);
jest.mock('./pages/Reservation/HistoryPage/HistoryPage', () => () => <div>History Page</div>);
jest.mock('./pages/Sean', () => () => <div>Sean Page</div>);

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('App Component', () => {
  test('renders UserProvider', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
  });

  test('renders Restaurant page on default route', () => {
    renderWithRouter(<App />);
    expect(screen.getByText('Restaurant Page')).toBeInTheDocument();
  });

  test('renders Login page on /login route', () => {
    renderWithRouter(<App />, { route: '/login' });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('renders Register page on /register route', () => {
    renderWithRouter(<App />, { route: '/register' });
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });

  test('renders Checkout page on /checkout route', () => {
    renderWithRouter(<App />, { route: '/checkout' });
    expect(screen.getByText('Checkout Page')).toBeInTheDocument();
  });

  test('renders Orders page on /orders route', () => {
    renderWithRouter(<App />, { route: '/orders' });
    expect(screen.getByText('Orders Page')).toBeInTheDocument();
  });

  test('renders Admin page on /admin route', () => {
    renderWithRouter(<App />, { route: '/admin' });
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  test('renders Dashboard page on /dashboard route', () => {
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  test('renders Menu page on /menu/:restaurantId route', () => {
    renderWithRouter(<App />, { route: '/menu/123' });
    expect(screen.getByText('Menu Page')).toBeInTheDocument();
  });

  test('renders Meal page on /menu/:restaurantId/:itemName route', () => {
    renderWithRouter(<App />, { route: '/menu/123/burger' });
    expect(screen.getByText('Meal Page')).toBeInTheDocument();
  });

  test('renders RestaurantInfo page on /restaurant-info/:id route', () => {
    renderWithRouter(<App />, { route: '/restaurant-info/123' });
    expect(screen.getByText('Restaurant Info Page')).toBeInTheDocument();
  });

  test('renders ReservationPage on /reservation/:id route', () => {
    renderWithRouter(<App />, { route: '/reservation/123' });
    expect(screen.getByText('Reservation Page')).toBeInTheDocument();
  });

  test('renders OrderSummaryPage on /order-summary route', () => {
    renderWithRouter(<App />, { route: '/order-summary' });
    expect(screen.getByText('Order Summary Page')).toBeInTheDocument();
  });

  test('renders HistoryPage on /history route', () => {
    renderWithRouter(<App />, { route: '/history' });
    expect(screen.getByText('History Page')).toBeInTheDocument();
  });

  test('renders Sean page on /sean route', () => {
    renderWithRouter(<App />, { route: '/sean' });
    expect(screen.getByText('Sean Page')).toBeInTheDocument();
  });
});