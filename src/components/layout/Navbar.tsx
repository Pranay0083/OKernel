import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const logo = '/logo.png';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Architecture', path: '/architecture' },
        { name: 'About', path: '/about' },
        // { name: 'Docs', path: '/docs' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${isScrolled
                ? 'bg-background/80 backdrop-blur-md border-border shadow-md py-2'
                : 'bg-transparent border-transparent py-4'
                }`}
        >
            <div className="w-full px-8 sm:px-12">
                <div className="flex items-center justify-between h-12">
                    <Link to="/" className="flex items-center gap-3 group font-mono text-sm">
                        <div className="w-8 h-8 rounded overflow-hidden transition-transform group-hover:scale-105">
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

                        {/* Auth Button */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard">
                                    <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                                        Dashboard
                                    </Button>
                                </Link>
                                <span className="hidden xl:inline text-xs font-mono text-zinc-500">{user.email}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleSignOut}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                                    title="Sign Out"
                                >
                                    <LogOut size={16} />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/auth">
                                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                                    Sign In
                                </Button>
                            </Link>
                        )}


                        {location.pathname.startsWith('/platform') || location.pathname === '/scheduler' ? (
                            <Link to="/">
                                <Button size="sm" variant="outline" className="rounded-full px-6 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                    Exit Visualizer
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/console">
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

                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full text-zinc-300 hover:text-white hover:bg-white/5 justify-start">
                                    Dashboard
                                </Button>
                            </Link>
                            <Button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 justify-start">
                                <LogOut size={16} className="mr-2" /> Sign Out ({user.email})
                            </Button>
                        </>
                    ) : (
                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                    )}

                    <Link to="/scheduler" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Launch App</Button>
                    </Link>
                </div>
            )}
        </nav>
    );
};
