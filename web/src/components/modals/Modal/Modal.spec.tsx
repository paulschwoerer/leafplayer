import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { ReactElement, useState } from 'react';
import Modal from './Modal';

describe('Modal', () => {
  it('renders title & content when visible', () => {
    render(
      <Modal title="Test Modal" hideModal={jest.fn()} isVisible={true}>
        <p>Sweet content</p>
      </Modal>,
    );

    expect(screen.getByText('Sweet content')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render title & content when not visible', () => {
    render(
      <Modal title="Test Modal" hideModal={jest.fn()} isVisible={false}>
        <p>Sweet content</p>
      </Modal>,
    );

    expect(screen.queryByText('Sweet content')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls hide callback when clicking the close button', async () => {
    const handleClose = jest.fn();

    render(
      <Modal title="Test Modal" hideModal={handleClose} isVisible={true} />,
    );

    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  it('calls hide callback when clicking the wrapper background', async () => {
    const handleClose = jest.fn();

    render(
      <Modal title="Test Modal" hideModal={handleClose} isVisible={true} />,
    );

    const background = screen.getByRole('dialog').parentElement;

    if (background === null) {
      throw Error('cannot get modal background element');
    }

    fireEvent.click(background);

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  it('calls hide callback when hitting the esc key', async () => {
    const handleClose = jest.fn();

    render(
      <Modal title="Test Modal" hideModal={handleClose} isVisible={true} />,
    );

    fireEvent.keyUp(screen.getByRole('dialog'), {
      key: 'Escape',
    });

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  it('should take focus when shown', async () => {
    render(<FocusTest />);

    const openButton = screen.getByText('Open');
    openButton.focus();

    fireEvent.click(openButton);

    const modal = await screen.findByRole('dialog');

    await waitFor(() => expect(modal).toHaveFocus());
  });

  it('should return focus on the last active element after hiding', async () => {
    render(<FocusTest />);

    const openButton = screen.getByText('Open');
    openButton.focus();

    fireEvent.click(openButton);

    const closeButton = await screen.findByLabelText('close');

    fireEvent.click(closeButton);

    await waitFor(() => expect(openButton).toHaveFocus());
  });
});

function FocusTest(): ReactElement {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button onClick={() => setVisible(!visible)}>Open</button>

      <Modal
        title="Test Modal"
        hideModal={() => setVisible(false)}
        isVisible={visible}
      ></Modal>
    </>
  );
}
