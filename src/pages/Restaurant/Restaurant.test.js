import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Restaurant from './Restaurant';

// Mock the restaurantData import
jest.mock('./restaurant.json', () => [
  {
    id: 1,
    name: 'Test Restaurant',
    location: 'Test Location',
    opening_time: '9:00 AM',
    closing_time: '10:00 PM',
  },
]);

// Mock the css import
jest.mock('./Restaurant.css', () => ({}));

describe('Restaurant Component', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <Restaurant />
      </Router>
    );

    // Check if the component renders the header
    expect(screen.getByText('Restaurant/Dining Hall Name')).toBeInTheDocument();

    // Check if the test restaurant data is rendered
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Location: Test Location')).toBeInTheDocument();
    expect(screen.getByText('Hours: 9:00 AM - 10:00 PM')).toBeInTheDocument();

    // Check if the buttons are rendered
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('More Info')).toBeInTheDocument();
  });
});