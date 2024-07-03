import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomCaptcha from './page';

// Mock the getUserMedia function
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [{
          stop: jest.fn(),
        }],
      })
    ),
  },
});

describe('CustomCaptcha', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial step with camera access', async () => {
    render(<CustomCaptcha />);
    
    expect(screen.getByText('Take Selfie')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'user' } });
    });
  });

  test('moves to step 2 when continue button is clicked', async () => {
    render(<CustomCaptcha />);
    
    fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
    
    await waitFor(() => {
      expect(screen.getByText(/Select/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'VALIDATE' })).toBeInTheDocument();
    });
  });

  test('renders sectors in step 2', async () => {
    render(<CustomCaptcha />);
    
    fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
    
    await waitFor(() => {
      const canvas = screen.getByRole('img');
      expect(canvas).toBeInTheDocument();
    });
  });

  test('allows sector selection in step 2', async () => {
    render(<CustomCaptcha />);
    
    fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
    
    await waitFor(() => {
      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 50, clientY: 50 });
    });
  });

  test('moves to step 3 when validate button is clicked', async () => {
    render(<CustomCaptcha />);
    
    fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'VALIDATE' }));
    });

    await waitFor(() => {
      expect(screen.getByText(/CAPTCHA (Passed|Failed)/)).toBeInTheDocument();
    });
  });
});