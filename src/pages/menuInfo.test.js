import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import MenuInfo from './menuInfo';

// Mock the restaurantData import
jest.mock('./restaurant.json', () => [
  {
    id: 'test1',
    name: 'Test Restaurant',
    location: 'Test Location',
    opening_time: '09:00',
    closing_time: '22:00',
    contact: {
      telephone: '123-456-7890',
      email: 'test@restaurant.com'
    },
    rating: 4.5
  },
]);

describe('MenuInfo Component', () => {
  test('renders loading state initially', () => {
    render(<Router><MenuInfo /></Router>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders restaurant information after loading', async () => {
    render(<Router><MenuInfo /></Router>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Restaurant/Dining Hall Name')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Details')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Location:')).toBeInTheDocument();
    expect(screen.getByText('Operating Hours:')).toBeInTheDocument();
    expect(screen.getByText('Contact details:')).toBeInTheDocument();
    expect(screen.getByText('Telephone:')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('rating:')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Date posted:')).toBeInTheDocument();
  });

  test('renders error message when data loading fails', async () => {
    // Mock the restaurantData to throw an error
    jest.mock('./restaurant.json', () => {
      throw new Error('Failed to load data');
    });

    render(<Router><MenuInfo /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
    });
  });

  test('renders no data message when restaurant list is empty', async () => {
    // Mock the restaurantData to return an empty array
    jest.mock('./restaurant.json', () => []);

    render(<Router><MenuInfo /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('No restaurant data available')).toBeInTheDocument();
    });
  });

  // Additional test for specific restaurant details
  test('displays correct restaurant details', async () => {
    render(<Router><MenuInfo /></Router>);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // These tests assume that you'll update the component to display the actual data
    // You may need to adjust these based on how you decide to display the data
    expect(screen.getByText(/Test Restaurant/)).toBeInTheDocument();
    expect(screen.getByText(/Test Location/)).toBeInTheDocument();
    expect(screen.getByText(/09:00 - 22:00/)).toBeInTheDocument();
    expect(screen.getByText(/123-456-7890/)).toBeInTheDocument();
    expect(screen.getByText(/test@restaurant.com/)).toBeInTheDocument();
    expect(screen.getByText(/4.5/)).toBeInTheDocument();
  });
});