import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoauthorPage from '../CoauthorPage.jsx';

test('CoauthorPage mounts without crashing', () => {
  render(React.createElement(CoauthorPage));
});
