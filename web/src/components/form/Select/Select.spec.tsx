import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Select from './Select';
const options = [
  {
    value: 'first',
    label: 'First',
  },
  {
    value: 'second',
    label: 'Second',
  },
];

describe('Select', () => {
  it('should allow selection of an option', async () => {
    const changeHandler = jest.fn();

    render(
      <Select value={options[0]} options={options} onChange={changeHandler} />,
    );

    const select = await screen.findByRole('button');

    fireEvent.click(select);

    const option = await screen.findByText('Second');

    fireEvent.click(option);

    expect(changeHandler).toHaveBeenCalledWith({
      value: 'second',
      label: 'Second',
    });
  });

  it('should display given value', async () => {
    render(<Select value={options[0]} options={[]} />);

    const select = await screen.findByRole('button');

    expect(select).toHaveTextContent('First');
  });
});
