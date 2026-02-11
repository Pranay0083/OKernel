import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { Check, Settings as SettingsIcon, Monitor, Type, Palette } from 'lucide-react';

// Types
type Theme = 'MATRIX' | 'AMBER' | 'CRIMSON' | 'PHANTOM' | 'ARCTIC';
type FontSize = 'SM' | 'MD' | 'LG';

interface DisplayPrefs {
  gridAnimation: boolean;
  reduceMotion: boolean;
}

interface TerminalPrefs {
  fontSize: FontSize;
}

const THEMES = [
  { id: 'MATRIX', label: 'Matrix', bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/50', hex: '#22c55e' },
  { id: 'AMBER', label: 'Amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/50', hex: '#f59e0b' },
  { id: 'CRIMSON', label: 'Crimson', bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/50', hex: '#ef4444' },
  { id: 'PHANTOM', label: 'Phantom', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500/50', hex: '#a855f7' },
  { id: 'ARCTIC', label: 'Arctic', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/50', hex: '#3b82f6' },
] as const;

const FONT_SIZES: FontSize[] = ['SM', 'MD', 'LG'];

export const Settings = () => {
  // State
  const [theme, setTheme] = useState<Theme>('MATRIX');
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPrefs>({
    gridAnimation: true,
    reduceMotion: false,
  });
  const [terminalPrefs, setTerminalPrefs] = useState<TerminalPrefs>({
    fontSize: 'MD',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('okernel_theme') as Theme;
    if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
      setTheme(savedTheme);
    }

    const savedDisplay = localStorage.getItem('okernel_display_prefs');
    if (savedDisplay) {
      setDisplayPrefs(JSON.parse(savedDisplay));
    }

    const savedTerminal = localStorage.getItem('okernel_terminal_prefs');
    if (savedTerminal) {
      setTerminalPrefs(JSON.parse(savedTerminal));
    }
  }, []);

  // Save changes
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('okernel_theme', newTheme);
  };

  const updateDisplayPrefs = (key: keyof DisplayPrefs) => {
    setDisplayPrefs(prev => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      localStorage.setItem('okernel_display_prefs', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  const updateTerminalPrefs = (size: FontSize) => {
    setTerminalPrefs({ fontSize: size });
    localStorage.setItem('okernel_terminal_prefs', JSON.stringify({ fontSize: size }));
  };

  const activeTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-green-500/30 selection:text-green-200 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full pt-24 px-4 pb-20 animate-in">
        <div className="flex items-center space-x-3 mb-8 text-zinc-400">
          <SettingsIcon size={20} />
          <h1 className="text-xl font-mono font-bold tracking-wider text-white">SYSTEM_CONFIGURATION</h1>
        </div>

        <div className="space-y-6">
          
          {/* Theme Configuration */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/60 flex items-center space-x-2">
              <Palette size={14} className="text-zinc-500" />
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">[THEME_CONFIG]</span>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-zinc-400 mb-6 font-mono">Select active system accent color override.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateTheme(t.id)}
                    className={`
                      relative group h-24 rounded-sm border transition-all duration-300 flex flex-col items-center justify-center space-y-3
                      ${theme === t.id 
                        ? `bg-zinc-900 ${t.border} shadow-[0_0_20px_rgba(0,0,0,0.5)]` 
                        : 'bg-zinc-950 border-white/5 hover:border-white/20 hover:bg-zinc-900'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full ${t.bg} shadow-lg flex items-center justify-center`}>
                      {theme === t.id && <Check size={16} className="text-black font-bold" />}
                    </div>
                    <span className={`text-xs font-mono font-bold ${theme === t.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                      {t.label}
                    </span>
                    
                    {theme === t.id && (
                       <div className={`absolute inset-0 rounded-sm ring-1 ring-inset ${activeTheme.border} opacity-50`}></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Display Preferences */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/60 flex items-center space-x-2">
              <Monitor size={14} className="text-zinc-500" />
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">[DISPLAY_PREFS]</span>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="grid-anim" className="block text-sm font-bold text-zinc-200 font-mono">Enable Grid Animation</label>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">Render background parity grid movement.</p>
                </div>
                <button
                  id="grid-anim"
                  aria-label="Enable Grid Animation"
                  onClick={() => updateDisplayPrefs('gridAnimation')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${displayPrefs.gridAnimation ? activeTheme.bg : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${displayPrefs.gridAnimation ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="reduce-motion" className="block text-sm font-bold text-zinc-200 font-mono">Reduce Motion</label>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">Disable complex transitions and animations.</p>
                </div>
                <button
                  id="reduce-motion"
                  aria-label="Reduce Motion"
                  onClick={() => updateDisplayPrefs('reduceMotion')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${displayPrefs.reduceMotion ? activeTheme.bg : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${displayPrefs.reduceMotion ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Terminal Preferences */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/60 flex items-center space-x-2">
              <Type size={14} className="text-zinc-500" />
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">[TERMINAL_PREFS]</span>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="block text-sm font-bold text-zinc-200 font-mono">Console Font Size</span>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">Adjust text scaling for terminal output.</p>
                </div>
                
                <div className="flex rounded-sm bg-zinc-950 p-1 border border-white/5">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => updateTerminalPrefs(size)}
                      className={`
                        px-4 py-1.5 rounded-sm text-xs font-mono font-bold transition-all
                        ${terminalPrefs.fontSize === size 
                          ? 'bg-zinc-800 text-white shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-6 p-4 bg-black rounded-sm border border-white/5 font-mono text-zinc-400 overflow-hidden">
                <div 
                  className={`transition-all duration-300 ${
                    terminalPrefs.fontSize === 'SM' ? 'text-xs' : 
                    terminalPrefs.fontSize === 'MD' ? 'text-sm' : 'text-base'
                  }`}
                  style={{ color: activeTheme.hex }}
                >
                  <p>&gt; sys_check --verbose</p>
                  <p className="opacity-70">[OK] Kernel integrity verified</p>
                  <p className="opacity-70">[OK] Memory modules loaded</p>
                  <p className="animate-pulse">_</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};
