import React from 'react';

const ReactKonva = jest.requireActual('react-konva');

// Mock Konva components
const mockComponent = (name) => {
  return jest.fn().mockImplementation(({ children, ...props }) => {
    return React.createElement(name, props, children);
  });
};

module.exports = {
  ...ReactKonva,
  Stage: mockComponent('Stage'),
  Layer: mockComponent('Layer'),
  Rect: mockComponent('Rect'),
  Line: mockComponent('Line'),
  Circle: mockComponent('Circle'),
  Image: mockComponent('Image'),
};