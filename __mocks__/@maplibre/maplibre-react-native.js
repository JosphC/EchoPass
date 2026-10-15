const React = require('react');
const { View } = require('react-native');

function passThrough(name) {
  const C = ({ children, testID }) => React.createElement(View, { testID: testID || name }, children);
  C.displayName = name;
  return C;
}

const Camera = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    setCamera: jest.fn(),
    fitBounds: jest.fn(),
    flyTo: jest.fn(),
    moveTo: jest.fn(),
    zoomTo: jest.fn(),
  }));
  return null;
});
Camera.displayName = 'Camera';

module.exports = {
  __esModule: true,
  default: {},
  Camera,
  MapView: passThrough('MapView'),
  PointAnnotation: passThrough('PointAnnotation'),
  ShapeSource: passThrough('ShapeSource'),
  MarkerView: passThrough('MarkerView'),
  CircleLayer: () => null,
  SymbolLayer: () => null,
  LineLayer: () => null,
  Images: () => null,
  UserLocation: () => null,
};
