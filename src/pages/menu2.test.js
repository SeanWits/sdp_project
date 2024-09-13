import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Menu2 from './menu2.js';
import restaurantData from "./restaurant.json"; //Mock API for testing
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

// Mock the restaurantData import
jest.mock('./restaurant.json', () => [
  {
    name: 'Test Restaurant',
    categories: [
      {
        name: 'Category 1',
        menu_items: [
          {
            name: 'Item 1',
            description: 'Description 1',
            price: 10.99,
            is_available: true,
          },
        ],
      },
      {
        name: 'Category 2',
        menu_items: [
          {
            name: 'Item 2',
            description: 'Description 2',
            price: 12.99,
            is_available: false,
          },
        ],
      },
    ],
  },
]);

describe('Menu2 Component', () => {
  test('renders restaurant name and categories', () => {
    render(<Menu2 />);
    
    expect(screen.getByText('Restaurant/Dining Hall Name')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  test('renders food items for the selected category', () => {
    render(<Menu2 />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Price: R10.99')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  test('changes category when clicked', () => {
    render(<Menu2 />);
    
    fireEvent.click(screen.getByText('Category 2'));
    
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('Price: R12.99')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });
});