import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockSignOut = vi.fn();
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(() => ({
        user: { id: '123', email: 'test@okernel.com' },
        loading: false,
        signOut: mockSignOut,
    })),
}));

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        limit: () => ({
                            data: [],
                            error: null
                        })
                    })
                })
            })
        })
    }
}));

// Mock Navbar/Footer to avoid complex rendering
vi.mock('../components/layout/Navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('../components/layout/Footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the dashboard with key components', async () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        // Check for loading state to disappear (it might be instant with mocks)
        // Check for specific text from the new UI
        expect(screen.getByText(/root@okernel/i)).toBeInTheDocument();
        expect(screen.getByText(/initializing_kernel_bridge/i)).toBeInTheDocument();
        expect(screen.getByText(/SYS_integrity/i)).toBeInTheDocument();
        
        // Check for Module links
        expect(screen.getByText('CPU_SCHEDULER')).toBeInTheDocument();
        expect(screen.getByText('CODE_TRACER')).toBeInTheDocument();
    });

    it('renders the file system table', async () => {
         render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );
        
        expect(screen.getByText(/\/var\/www\/recent_files/i)).toBeInTheDocument();
    });
});
