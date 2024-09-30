import React from 'react';
import { render } from '@testing-library/react';
import LoadModal from './LoadModal';

// Mock the ClimbingBoxLoader component
jest.mock('react-spinners/ClimbingBoxLoader', () => {
  return function DummyClimbingBoxLoader(props) {
    return <div data-testid="mock-loader" {...props} />;
  };
});

describe('LoadModal Component', () => {
  test('returns null when loading is false', () => {
    const { container } = render(<LoadModal loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders load-modal div when loading is true', () => {
    const { container } = render(<LoadModal loading={true} />);
    const loadModal = container.firstChild;
    expect(loadModal).not.toBeNull();
    expect(loadModal).toHaveClass('load-modal');
  });

  test('renders ClimbingBoxLoader with correct props when loading is true', () => {
    const { getByTestId } = render(<LoadModal loading={true} />);
    const loader = getByTestId('mock-loader');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('color', '#ffe500');
    expect(loader).toHaveAttribute('size', '15');
    expect(loader).toHaveAttribute('aria-label', 'Loading Spinner');
    expect(loader).toHaveAttribute('data-testid', 'loader');
  });
});