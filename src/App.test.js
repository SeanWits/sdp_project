import React from 'react';
import { act } from 'react-dom/test-utils';
jest.spyOn(console, 'error').mockImplementation(() => {});
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('displays "O(n) Site" text', () => {
    render(<App />);
    const siteText = screen.getByText(/O\(n\) Site/i);
    expect(siteText).toBeInTheDocument();
  });
});