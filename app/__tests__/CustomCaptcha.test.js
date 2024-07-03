// import React from 'react';
// import { render, fireEvent, screen } from '@testing-library/react';
// import CustomCaptcha from '../page';

// // Mock the navigator.mediaDevices
// Object.defineProperty(global.navigator, 'mediaDevices', {
//   value: {
//     getUserMedia: jest.fn().mockResolvedValue('mocked-stream'),
//   },
//   writable: true,
// });

// describe('CustomCaptcha Component', () => {
//   test('renders initial step correctly', () => {
//     render(<CustomCaptcha />);
//     expect(screen.getByText('Take Selfie')).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
//   });

//   test('advances to next step when continue is clicked', async () => {
//     render(<CustomCaptcha />);
//     fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
//     expect(await screen.findByText(/Select (triangle|square|circle)s/)).toBeInTheDocument();
//   });

//   test('validates user selection', async () => {
//     render(<CustomCaptcha />);
//     fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
//     await screen.findByText(/Select (triangle|square|circle)s/);
    
//     // Simulate user selection (you might need to adjust this based on your actual implementation)
//     const gridItems = screen.getAllByTestId('grid-item');
//     fireEvent.click(gridItems[0]);
//     fireEvent.click(gridItems[1]);

//     fireEvent.click(screen.getByRole('button', { name: 'VALIDATE' }));
    
//     // Check for validation result (adjust based on your implementation)
//     expect(await screen.findByText(/CAPTCHA (Passed|Failed)/)).toBeInTheDocument();
//   });
// });