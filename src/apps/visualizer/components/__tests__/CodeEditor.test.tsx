import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CodeEditor from '../CodeEditor';

vi.mock('@monaco-editor/react', () => ({
    Editor: (props: any) => {
        return <div data-testid="monaco-editor">{props.value}</div>;
    },
    useMonaco: () => ({
        Range: vi.fn(),
    }),
}));

describe('CodeEditor', () => {
    const mockChange = vi.fn();

    it('renders editor with initial code', () => {
        render(
            <CodeEditor
                code="print('hello')"
                onChange={mockChange}
                language="python"
            />
        );
        // screen.debug(); // Commented out to reduce noise if passing
        // The mock renders the code as text content of the div
        expect(screen.getByTestId('monaco-editor')).toHaveTextContent("print('hello')");
    });
});
