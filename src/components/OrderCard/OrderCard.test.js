import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderCard from './OrderCard';

const mockOrder = {
  id: 'order123',
  restaurantDetails: {
    name: 'Test Restaurant',
    restImg: 'http://example.com/image.jpg'
  },
  items: [
    { name: 'Burger', quantity: 2 },
    { name: 'Fries', quantity: 1 }
  ],
  createdAt: new Date('2023-01-01T12:00:00'),
  totalAmount: 25.50,
  status: 'ongoing'
};

const renderOrderCard = (props = {}) => {
  return render(<OrderCard order={mockOrder} onStatusUpdate={() => {}} {...props} />);
};

describe('OrderCard Component', () => {

  test('renders correct number of items', () => {
    renderOrderCard();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Fries')).toBeInTheDocument();
  });

  test('displays restaurant image when available', () => {
    renderOrderCard();

    const image = screen.getByAltText('Test Restaurant');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'http://example.com/image.jpg');
  });

  test('displays placeholder when restaurant image is not available', () => {
    const orderWithoutImage = {
      ...mockOrder,
      restaurantDetails: { ...mockOrder.restaurantDetails, restImg: null }
    };
    render(<OrderCard order={orderWithoutImage} onStatusUpdate={() => {}} />);

    expect(screen.queryByAltText('Test Restaurant')).not.toBeInTheDocument();
    expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
  });

  test('toggles status options on status click', async () => {
    renderOrderCard();

    fireEvent.click(screen.getByText('ongoing'));

    await waitFor(() => {
      expect(screen.getByText('Collected')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('ongoing'));

    await waitFor(() => {
      expect(screen.queryByText('Collected')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  test('calls onStatusUpdate when a new status is selected', async () => {
    const mockOnStatusUpdate = jest.fn();
    renderOrderCard({ onStatusUpdate: mockOnStatusUpdate });

    fireEvent.click(screen.getByText('ongoing'));
    await waitFor(() => {
      fireEvent.click(screen.getByText('Collected'));
    });

    expect(mockOnStatusUpdate).toHaveBeenCalledWith('order123', 'collected');
  });

  test('applies correct status class', () => {
    const { rerender } = renderOrderCard();

    expect(screen.getByText('ongoing')).toHaveClass('status-ongoing');

    rerender(<OrderCard order={{ ...mockOrder, status: 'collected' }} onStatusUpdate={() => {}} />);
    expect(screen.getByText('collected')).toHaveClass('status-collected');

    rerender(<OrderCard order={{ ...mockOrder, status: 'cancelled' }} onStatusUpdate={() => {}} />);
    expect(screen.getByText('cancelled')).toHaveClass('status-cancelled');
  });
});