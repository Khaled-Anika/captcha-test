import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomCaptcha from './page';

// Mock react-konva
jest.mock('react-konva');

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

// Mock Image
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload();
    }, 100);
  }
};

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
      expect(screen.getByTestId('captcha-stage')).toBeInTheDocument();
    });
  });

  test('allows sector selection in step 2', async () => {
    render(<CustomCaptcha />);
    
    fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
    
    await waitFor(() => {
      const stage = screen.getByTestId('captcha-stage');
      expect(stage).toBeInTheDocument();
      fireEvent.click(stage);
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