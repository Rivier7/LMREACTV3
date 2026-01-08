import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import userEvent from '@testing-library/user-event';

// Mock the entire AuthContext module
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Import after mocking
import { useAuth } from '../context/AuthContext';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token) => ({
    sub: 'test@example.com',
    email: 'test@example.com',
  })),
}));

// Helper to render component with router
const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the company name "Marken"', () => {
    useAuth.mockReturnValue({
      token: 'mock-token',
      logout: vi.fn(),
    });

    renderHeader();

    expect(screen.getByText('Marken')).toBeInTheDocument();
  });

  it('should display navigation links', () => {
    useAuth.mockReturnValue({
      token: 'mock-token',
      logout: vi.fn(),
    });

    renderHeader();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Lanes')).toBeInTheDocument();
  });

  it('should display user email when authenticated', () => {
    useAuth.mockReturnValue({
      token: 'mock-token',
      logout: vi.fn(),
    });

    renderHeader();

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();

    useAuth.mockReturnValue({
      token: 'mock-token',
      logout: mockLogout,
    });

    renderHeader();

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should render logout button', () => {
    useAuth.mockReturnValue({
      token: 'mock-token',
      logout: vi.fn(),
    });

    renderHeader();

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveClass('bg-red-600');
  });

  it('should have correct navigation links', () => {
    useAuth.mockReturnValue({
      token: 'mock-token',
      logout: vi.fn(),
    });

    renderHeader();

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const lanesLink = screen.getByText('Lanes').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(lanesLink).toHaveAttribute('href', '/lanes');
  });
});
