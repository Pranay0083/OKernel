import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { config } = useSystemConfig();
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <Navbar />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <span className="text-xs text-zinc-500 font-mono mt-1 invisible md:visible">{config.version}</span>
            <Footer />
        </div>
    );
};


