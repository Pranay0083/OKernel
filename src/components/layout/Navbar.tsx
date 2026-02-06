import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

import logo from '../../assets/OKernel.png';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Architecture', path: '/dev/architecture' },
        { name: 'About', path: '/dev/about' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${isScrolled
                ? 'bg-background/80 backdrop-blur-md border-border shadow-md py-2'
                : 'bg-transparent border-transparent py-4'
                }`}
        >
            <div className="w-full px-8 sm:px-12"> {/* Updated container to be full width with margin */}
                <div className="flex items-center justify-between h-12">
                    <Link to="/" className="flex items-center gap-3 group font-mono text-sm">
                        {/* Logo Image */}
                        <div className="w-10 h-10 rounded overflow-hidden transition-transform group-hover:scale-105">
                            <img src={logo} alt="OKernel Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold tracking-tight text-foreground text-lg group-hover:text-primary transition-colors">
                            OKernel
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {location.pathname === '/dev/scheduler' || location.pathname === '/visualizer' ? (
                            <Link to="/">
                                <Button size="sm" variant="outline" className="rounded-full px-6 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                    Exit Visualizer
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/dev/console">
                                <Button size="sm" className="rounded-full px-6 font-mono font-bold">
                                    &gt;_ Launch Console
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-muted-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-xl p-4 flex flex-col gap-4 animate-fade-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-lg font-medium p-2 rounded-lg hover:bg-muted ${isActive(link.path) ? 'text-primary bg-muted/50' : 'text-muted-foreground'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link to="/dev/scheduler" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Launch App</Button>
                    </Link>
                </div>
            )}
        </nav>
    );
};
