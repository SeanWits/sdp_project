import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Test from './Test';

// Mock the firebase module
jest.mock('./firebase', () => ({
  db: {},
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
}));

describe('Test Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<Test />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('fetches and displays user data', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
    };

    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => mockUserData,
    });

    require('./firebase').getDoc.mockImplementation(mockGetDoc);

    render(<Test />);

    await waitFor(() => {
      expect(screen.getByText('User Data:')).toBeInTheDocument();
      expect(screen.getByText('Name: John')).toBeInTheDocument();
      expect(screen.getByText('Surname: Doe')).toBeInTheDocument();
    });
  });

  test('handles error when fetching user data fails', async () => {
    const mockGetDoc = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    require('./firebase').getDoc.mockImplementation(mockGetDoc);

    render(<Test />);

    await waitFor(() => {
      expect(screen.getByText('Error: Error fetching user data: Fetch failed')).toBeInTheDocument();
    });
  });

  test('adds restaurants to Firestore', async () => {
    const mockSetDoc = jest.fn().mockResolvedValue();
    require('./firebase').setDoc.mockImplementation(mockSetDoc);

    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'John', surname: 'Doe' }),
    });
    require('./firebase').getDoc.mockImplementation(mockGetDoc);

    render(<Test />);

    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalledTimes(3); // As there are 3 restaurants in the data
    });

    expect(console.log).toHaveBeenCalledWith('Restaurants added successfully');
  });

  test('handles error when adding restaurants fails', async () => {
    const mockSetDoc = jest.fn().mockRejectedValue(new Error('Add failed'));
    require('./firebase').setDoc.mockImplementation(mockSetDoc);

    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'John', surname: 'Doe' }),
    });
    require('./firebase').getDoc.mockImplementation(mockGetDoc);

    render(<Test />);

    await waitFor(() => {
      expect(screen.getByText('Error: Error adding restaurants: Add failed')).toBeInTheDocument();
    });
  });
});