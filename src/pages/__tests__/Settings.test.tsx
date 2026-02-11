import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Settings } from '../Settings';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@okernel.os', id: '123' },
    loading: false,
    signOut: vi.fn(),
  }),
}));

// Mock Navbar and Footer
vi.mock('../../components/layout/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));
vi.mock('../../components/layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('Settings Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderSettings = () => {
    return render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
  };

  it('renders all settings sections correctly', () => {
    renderSettings();
    
    expect(screen.getByText(/THEME_CONFIG/)).toBeInTheDocument();
    expect(screen.getByText(/DISPLAY_PREFS/)).toBeInTheDocument();
    expect(screen.getByText(/TERMINAL_PREFS/)).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('updates theme in localStorage when selected', async () => {
    renderSettings();
    
    // Find the CRIMSON theme option
    const crimsonOption = screen.getByText('Crimson');
    fireEvent.click(crimsonOption);
    
    await waitFor(() => {
      expect(localStorage.getItem('okernel_theme')).toBe('CRIMSON');
    });
  });

  it('toggles grid animation preference', async () => {
    renderSettings();
    
    const toggle = screen.getByLabelText(/Enable Grid Animation/i);
    fireEvent.click(toggle);
    
    await waitFor(() => {
      const prefs = JSON.parse(localStorage.getItem('okernel_display_prefs') || '{}');
      expect(prefs).toHaveProperty('gridAnimation');
    });
  });

  it('updates font size preference', async () => {
    renderSettings();
    
    const lgOption = screen.getByText('LG');
    fireEvent.click(lgOption);
    
    await waitFor(() => {
      const prefs = JSON.parse(localStorage.getItem('okernel_terminal_prefs') || '{}');
      expect(prefs.fontSize).toBe('LG');
    });
  });

  it('loads saved preferences from localStorage on mount', () => {
    localStorage.setItem('okernel_theme', 'PHANTOM');
    
    renderSettings();
    
    expect(screen.getByText('Phantom')).toBeInTheDocument();
  });
});
