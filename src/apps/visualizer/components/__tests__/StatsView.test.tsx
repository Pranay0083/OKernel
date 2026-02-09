import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatsView } from '../StatsView';

// Mock Recharts to avoid rendering issues in JSDOM
vi.mock('recharts', () => {
    const OriginalModule = vi.importActual('recharts');
    return {
        ...OriginalModule,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Pie: ({ data }: any) => (
            <div data-testid="pie">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.map((d: any) => (
                    <div key={d.name} data-testid="pie-slice" data-name={d.name} data-value={d.value} />
                ))}
            </div>
        ),
        Cell: () => <div />,
        Tooltip: () => <div />,
        AreaChart: () => <div />,
        Area: () => <div />,
    };
});

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Cpu: () => <div data-testid="icon-cpu" />,
    Zap: () => <div data-testid="icon-zap" />,
    Database: () => <div data-testid="icon-database" />,
    Server: () => <div data-testid="icon-server" />,
    Activity: () => <div data-testid="icon-activity" />,
    ArrowRight: () => <div data-testid="icon-arrow-right" />,
}));

describe('StatsView', () => {
    const mockHistory = [
        { hardware: { type: 'ALU', cost: 1, opcode: 'ADD' } },
        { hardware: { type: 'MEM_READ', cost: 2, opcode: 'LOAD_FAST' } },
        { hardware: { type: 'MEM_WRITE', cost: 2, opcode: 'STORE_FAST' } },
        { hardware: { type: 'CONTROL', cost: 1, opcode: 'JUMP_ABSOLUTE' } },
    ];

    it('renders instruction mix correctly', () => {
        render(<StatsView history={mockHistory} />);

        const pieSlices = screen.getAllByTestId('pie-slice');
        expect(pieSlices).toHaveLength(4); // 4 distinct types in mock above? No wait.

        // Actually types are ALU, MEM_READ, MEM_WRITE, CONTROL. All unique.
        // Let's verify data
        expect(screen.getByText('Instruction Mix')).toBeInTheDocument();
        expect(screen.getByText('Total Cycles')).toBeInTheDocument();
    });

    it('calculates total cycles correctly', () => {
        render(<StatsView history={mockHistory} />);
        // Total cost = 1 + 2 + 2 + 1 = 6
        expect(screen.getByText('6')).toBeInTheDocument(); // Cycles
    });

    it('calculates instruction count correctly', () => {
        render(<StatsView history={mockHistory} />);
        // 4 instructions
        expect(screen.getByText('Instructions')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('renders execution pipeline with correct items', () => {
        render(<StatsView history={mockHistory} />);

        // Check for opcodes in the tape
        expect(screen.getByText('ADD')).toBeInTheDocument();
        expect(screen.getByText('LOAD_FAST')).toBeInTheDocument();
        expect(screen.getByText('STORE_FAST')).toBeInTheDocument();
        expect(screen.getByText('JUMP_ABSOLUTE')).toBeInTheDocument();
    });

    it('handles empty history gracefully', () => {
        render(<StatsView history={[]} />);
        expect(screen.getByText('No instructions recorded. Run code to see the pipeline.')).toBeInTheDocument();

        // Total cycles should be 0. There might be multiple 0s (CPI 0.00, etc)
        // Let's verify specific sections
        const totalCycles = screen.getByText('Total Cycles').nextElementSibling;
        expect(totalCycles).toHaveTextContent('0');
    });
});
