import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Github, Bug, Lightbulb, GitPullRequest } from 'lucide-react';

const CommunityLayout = ({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) => (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground font-mono">{subtitle}</p>
                </div>
                {children}
            </div>
        </main>
        <Footer />
    </div>
);

export const ReportBug = () => (
    <CommunityLayout title="Report a Bug" subtitle="/var/crash/report">
        <div className="bg-zinc-900/50 border border-border rounded-lg p-8 space-y-6">
            <Bug size={48} className="mx-auto text-red-500" />
            <p className="text-zinc-300">
                Found a kernel panic or a glitch in the simulation? <br />
                Please verify it exists in the latest version (v1.0.1) and report it on our GitHub.
            </p>
            <a href="https://github.com/Vaiditya2207/OKernel/issues/new?template=bug_report.md" target="_blank" rel="noreferrer">
                <Button className="w-full gap-2">
                    <Github size={16} /> Open Issue on GitHub
                </Button>
            </a>
        </div>
    </CommunityLayout>
);

export const RequestFeature = () => (
    <CommunityLayout title="Request Feature" subtitle="/etc/features/wishlist">
        <div className="bg-zinc-900/50 border border-border rounded-lg p-8 space-y-6">
            <Lightbulb size={48} className="mx-auto text-yellow-400" />
            <p className="text-zinc-300">
                Have an idea for a new scheduling algorithm or simulation feature? <br />
                We'd love to hear about it!
            </p>
            <a href="https://github.com/Vaiditya2207/OKernel/discussions/new?category=ideas" target="_blank" rel="noreferrer">
                <Button className="w-full gap-2" variant="outline">
                    <Github size={16} /> Start a Discussion
                </Button>
            </a>
        </div>
    </CommunityLayout>
);

export const Contributing = () => (
    <CommunityLayout title="Contributing" subtitle="/usr/src/linux/CONTRIBUTING.md">
        <div className="bg-zinc-900/50 border border-border rounded-lg p-8 space-y-6">
            <GitPullRequest size={48} className="mx-auto text-green-400" />
            <p className="text-zinc-300">
                Join the development team! Fork the repo, make your changes, and submit a Pull Request.
            </p>
            <div className="text-left bg-black/50 p-4 rounded font-mono text-xs text-zinc-500 space-y-2">
                <div>$ git clone https://github.com/Vaiditya2207/OKernel.git</div>
                <div>$ git checkout -b feature/awesome-thing</div>
                <div>$ git push origin feature/awesome-thing</div>
            </div>
            <a href="https://github.com/Vaiditya2207/OKernel" target="_blank" rel="noreferrer">
                <Button className="w-full gap-2">
                    <Github size={16} /> View Repository
                </Button>
            </a>
        </div>
    </CommunityLayout>
);
