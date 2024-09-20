import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Meal from './Meal';

// Mock the restaurantData import
jest.mock('./restaurant.json', () => [
  {
    id: 'test1',
    name: 'Test Restaurant',
    location: 'Test Location',
    opening_time: '09:00',
    closing_time: '22:00',
  },
]);

describe('Menu3 Component', () => {
  test('renders loading state initially', () => {
    render(<Router><Menu3 /></Router>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders restaurant data after loading', async () => {
    render(<Router><Menu3 /></Router>);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Restaurant/Dining Hall Name')).toBeInTheDocument();
    expect(screen.getByText('Meal Name')).toBeInTheDocument();
    expect(screen.getByText('A description')).toBeInTheDocument();
    expect(screen.getByText('Customise order')).toBeInTheDocument();
    expect(screen.getByText('Add to cart')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Date posted:')).toBeInTheDocument();
  });

  test('renders error message when data loading fails', async () => {
    // Mock the restaurantData to throw an error
    jest.mock('./restaurant.json', () => {
      throw new Error('Failed to load data');
    });

    render(<Router><Menu3 /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load restaurant data')).toBeInTheDocument();
    });
  });

  test('renders no data message when restaurant list is empty', async () => {
    // Mock the restaurantData to return an empty array
    jest.mock('./restaurant.json', () => []);

    render(<Router><Menu3 /></Router>);
    
    await waitFor(() => {
      expect(screen.getByText('No restaurant data available')).toBeInTheDocument();
    });
  });
});