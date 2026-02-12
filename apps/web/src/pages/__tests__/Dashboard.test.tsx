import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Fix mock paths to be relative to this test file (../../ instead of ../)

// Mock config to skip Supabase
vi.mock('../../config', () => ({
    config: {
        enableMockAuth: true,
        apiUrl: 'http://localhost:3000',
    }
}));

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
// Create stable mock objects to prevent infinite loops in useEffect
const mockUser = { id: '123', email: 'test@okernel.com' };
const mockAuthReturn = {
    user: mockUser,
    loading: false,
    signOut: mockSignOut,
};

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => mockAuthReturn,
}));

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
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
vi.mock('../../components/layout/Navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('../../components/layout/Footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));

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
        await waitFor(() => {
            expect(screen.getByText(/root@okernel/i)).toBeInTheDocument();
        });
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
        
        await waitFor(() => {
            expect(screen.getByText(/\/var\/www\/recent_files/i)).toBeInTheDocument();
        });
    });
});
