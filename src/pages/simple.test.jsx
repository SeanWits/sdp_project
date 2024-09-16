import React from 'react';
import { render } from '@testing-library/react';

const SimpleComponent = () => <div>Hello, World!</div>;

test('renders simple component', () => {
  const { getByText } = render(<SimpleComponent />);
  const element = getByText(/Hello, World!/i);
  expect(element).toBeInTheDocument();
});