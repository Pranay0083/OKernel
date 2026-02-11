import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SympathyLanding } from './LandingPage';
import { describe, it, expect } from 'vitest';

describe('SympathyLanding', () => {
    it('should have the @keyframes scan definition in the style block', () => {
        const { container } = render(
            <MemoryRouter>
                <SympathyLanding />
            </MemoryRouter>
        );

        // Find the style tag containing our custom fonts and hopefully the keyframes
        const styleTags = container.querySelectorAll('style');
        let foundKeyframes = false;

        styleTags.forEach(style => {
            if (style.innerHTML.includes('@keyframes scan')) {
                foundKeyframes = true;
            }
        });

        expect(foundKeyframes).toBe(true);
    });
});
