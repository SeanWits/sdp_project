import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';

// Mock all the page components
jest.mock('./pages/Restaurant/Restaurant', () => () => <div data-testid="restaurant-page">Restaurant Page</div>);
jest.mock('./pages/Login/Login', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('./pages/Register/Register', () => () => <div data-testid="register-page">Register Page</div>);
jest.mock('./pages/Checkout/Checkout', () => () => <div data-testid="checkout-page">Checkout Page</div>);
jest.mock('./pages/Orders/Orders', () => () => <div data-testid="orders-page">Orders Page</div>);
jest.mock('./pages/Admin/Admin', () => () => <div data-testid="admin-page">Admin Page</div>);
jest.mock('./pages/Dashboard/Dashboard', () => () => <div data-testid="dashboard-page">Dashboard Page</div>);
jest.mock('./pages/Menu/Menu', () => () => <div data-testid="menu-page">Menu Page</div>);
jest.mock('./pages/Meal/Meal', () => () => <div data-testid="meal-page">Meal Page</div>);
jest.mock('./pages/RestaurantInfo/RestaurantInfo', () => () => <div data-testid="restaurant-info-page">Restaurant Info Page</div>);
jest.mock('./pages/Reservation/ReservationPage/ReservationPage', () => () => <div data-testid="reservation-page">Reservation Page</div>);
jest.mock('./pages/Reservation/OrderSummaryPage/OrderSummaryPage', () => () => <div data-testid="order-summary-page">Order Summary Page</div>);
jest.mock('./pages/Reservation/HistoryPage/HistoryPage', () => () => <div data-testid="history-page">History Page</div>);
jest.mock('./pages/Sean', () => () => <div data-testid="sean-page">Sean Page</div>);

// Mock UserProvider
jest.mock('./utils/userContext', () => ({
  UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('App Component', () => {
  test('renders UserProvider', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />);
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
  });

  test('renders Restaurant page on default route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />);
    expect(screen.getByTestId('restaurant-page')).toBeInTheDocument();
  });

  test('renders Login page on /login route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/login' });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('renders Register page on /register route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/register' });
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
  });

  test('renders Checkout page on /checkout route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/checkout' });
    expect(screen.getByTestId('checkout-page')).toBeInTheDocument();
  });

  test('renders Orders page on /orders route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/orders' });
    expect(screen.getByTestId('orders-page')).toBeInTheDocument();
  });

  test('renders Admin page on /admin route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/admin' });
    expect(screen.getByTestId('admin-page')).toBeInTheDocument();
  });

  test('renders Dashboard page on /dashboard route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/dashboard' });
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  test('renders Menu page on /menu/:restaurantId route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/menu/123' });
    expect(screen.getByTestId('menu-page')).toBeInTheDocument();
  });

  test('renders Meal page on /menu/:restaurantId/:itemName route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/menu/123/burger' });
    expect(screen.getByTestId('meal-page')).toBeInTheDocument();
  });

  test('renders RestaurantInfo page on /restaurant-info/:id route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/restaurant-info/123' });
    expect(screen.getByTestId('restaurant-info-page')).toBeInTheDocument();
  });

  test('renders ReservationPage on /reservation/:id route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/reservation/123' });
    expect(screen.getByTestId('reservation-page')).toBeInTheDocument();
  });

  test('renders OrderSummaryPage on /order-summary route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/order-summary' });
    expect(screen.getByTestId('order-summary-page')).toBeInTheDocument();
  });

  test('renders HistoryPage on /history route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/history' });
    expect(screen.getByTestId('history-page')).toBeInTheDocument();
  });

  test('renders Sean page on /sean route', () => {
    renderWithRouter(<App RouterComponent={({ children }) => <>{children}</>} />, { route: '/sean' });
    expect(screen.getByTestId('sean-page')).toBeInTheDocument();
  });

});
