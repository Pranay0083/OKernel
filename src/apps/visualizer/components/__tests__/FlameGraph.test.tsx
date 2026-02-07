import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FlameGraph } from '../FlameGraph';

// Mock Recharts and Framer Motion if needed, but FlameGraph seems to use raw divs.
// It uses framer-motion? Let's check imports.
// Ah, it imports motion from framer-motion in the code I read earlier.

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

describe('FlameGraph', () => {
    const mockHistory = [
        { type: 'Trace', function: 'root', duration: 1000, stack_depth: 1, timestamp: 0 },
        { type: 'Trace', function: 'child', duration: 500, stack_depth: 2, timestamp: 100 },
    ];

    it('renders flame graph title', () => {
        render(<FlameGraph history={mockHistory} />);
        expect(screen.getByText(/CPU FLAME GRAPH/)).toBeInTheDocument();
    });

    it('calculates total time correctly', () => {
        render(<FlameGraph history={mockHistory} />);
        // Total duration is sum of all events in this simple implementation?
        // Let's check logic:
        // history.forEach -> totalTime += event.duration;
        // So 1000 + 500 = 1500ns = 1.5µs

        expect(screen.getByText('1.5µs Total Time')).toBeInTheDocument();
    });

    it('renders blocks for functions', () => {
        render(<FlameGraph history={mockHistory} />);

        // Use text content to find blocks
        // The block name logic: {block.duration > (totalTime * 0.05) ? block.name : ''}
        // 1000 > 75, so 'root:undefined' (line is undefined in mock) should show?
        // Wait, name is `${event.function}:${event.line}`

        // Use a regex matcher for flexibility
        // Expect 'root:undefined' might be ugly, but verifying existence.
        // Actually, let's fix the mock to include line numbers for cleaner test.
    });
});

describe('FlameGraph with Lines', () => {
    const mockHistoryWithLines = [
        { type: 'Trace', function: 'main', line: 10, duration: 1000, stack_depth: 1 },
    ];

    it('renders function name and line number', () => {
        render(<FlameGraph history={mockHistoryWithLines} />);
        // Use getAllByText because tooltip also contains the text
        expect(screen.getAllByText(/main:10/)).not.toHaveLength(0);
    });

    it('handles empty history', () => {
        render(<FlameGraph history={[]} />);
        expect(screen.getByText(/Running code/)).toBeInTheDocument();
    });
});
