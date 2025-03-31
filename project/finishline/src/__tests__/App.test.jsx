/**
 * Basic App component test
 */
import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

// Mock dependencies
jest.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock('../contexts/ConfigContext', () => ({
  ConfigProvider: ({ children }) => <div data-testid="config-provider">{children}</div>,
}));

jest.mock('../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }) => <div data-testid="notification-provider">{children}</div>,
}));

jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('../contexts/DialogContext', () => ({
  DialogProvider: ({ children }) => <div data-testid="dialog-provider">{children}</div>,
}));

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
}));

// Mock AppRoutes
jest.mock('../AppRoutes', () => () => <div data-testid="app-routes">App Routes</div>);

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});