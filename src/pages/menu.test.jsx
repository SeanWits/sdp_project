import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Menu from './menu.js';
import restaurantData from "./restaurant.json"; //Mock API for testing
import { useState, useEffect } from "react";


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

describe('Menu Component', () => {
  test('renders restaurant information', () => {
    render(<Menu />);
    
    expect(screen.getByText('Restaurant/Dining Hall Name')).toBeInTheDocument();
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Location: Test Location')).toBeInTheDocument();
    expect(screen.getByText('Hours: 9:00 AM - 10:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Rating:')).toBeInTheDocument();
  });

  test('renders Menu and More Info buttons', () => {
    render(<Menu />);
    
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('More Info')).toBeInTheDocument();
  });
});