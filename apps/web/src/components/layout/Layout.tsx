import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    showFooter?: boolean;
    isApp?: boolean; // If true, prevents body scroll for app-like layouts
}

import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<LayoutProps> = ({ children, showFooter = true, isApp = false }) => {
    const { config } = useSystemConfig();
    const _location = useLocation();

    return (
        <div className={`flex flex-col bg-background text-foreground font-sans ${isApp ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <Navbar />
            <main className={`flex-1 pt-16 ${isApp ? 'overflow-hidden flex flex-col' : ''}`}>
                {children}
            </main>
            {!isApp && <span className="text-xs text-zinc-500 font-mono mt-1 invisible md:visible">{config.version}</span>}
            {showFooter && !isApp && <Footer />}
        </div>
    );
};


