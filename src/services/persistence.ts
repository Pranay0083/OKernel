
export interface JobRecord {
    id: string;
    timestamp: number;
    code: string;
    language: 'python' | 'cpp';
    status: 'success' | 'failed';
    duration: number; // ms
    input?: string;
}

export interface UserSession {
    userId: string;
    theme: 'dark' | 'light';
    recentJobs: JobRecord[];
    favoriteJobs: string[]; // IDs
}

const STORAGE_KEY = 'okernel_user_session_v1';

export const Persistence = {
    // Initialize or Load Session
    getSession: (): UserSession => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const session = JSON.parse(raw);
                // MIGRATION: Inject seed data if empty (for demo purposes)
                if (!session.recentJobs || session.recentJobs.length === 0) {
                    session.recentJobs = [
                        {
                            id: 'seed_job_1',
                            timestamp: Date.now() - 100000,
                            code: 'print("Hello World")',
                            language: 'python',
                            status: 'success',
                            duration: 120
                        },
                        {
                            id: 'seed_job_2',
                            timestamp: Date.now() - 500000,
                            code: '# Memory Test\nx = [1] * 1000',
                            language: 'python',
                            status: 'failed',
                            duration: 450
                        }
                    ];
                    // Save the update
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
                }
                return session;
            } catch (e) {
                console.error('Failed to parse session', e);
            }
        }

        // Default Session with Seed Data for visibility
        const newSession: UserSession = {
            userId: 'user_' + Math.random().toString(36).substring(2, 9),
            theme: 'dark',
            recentJobs: [
                {
                    id: 'seed_job_1',
                    timestamp: Date.now() - 100000,
                    code: 'print("Hello World")',
                    language: 'python',
                    status: 'success',
                    duration: 120
                },
                {
                    id: 'seed_job_2',
                    timestamp: Date.now() - 500000,
                    code: '# Memory Test\nx = [1] * 1000',
                    language: 'python',
                    status: 'failed',
                    duration: 450
                }
            ],
            favoriteJobs: []
        };
        Persistence.saveSession(newSession);
        return newSession;
    },

    saveSession: (session: UserSession) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    },

    addJob: (job: JobRecord) => {
        const session = Persistence.getSession();
        // Add to beginning, limit to 50
        session.recentJobs.unshift(job);
        if (session.recentJobs.length > 50) {
            session.recentJobs = session.recentJobs.slice(0, 50);
        }
        Persistence.saveSession(session);
    },

    toggleFavorite: (jobId: string) => {
        const session = Persistence.getSession();
        if (session.favoriteJobs.includes(jobId)) {
            session.favoriteJobs = session.favoriteJobs.filter(id => id !== jobId);
        } else {
            session.favoriteJobs.push(jobId);
        }
        Persistence.saveSession(session);
    },

    getJob: (jobId: string): JobRecord | undefined => {
        const session = Persistence.getSession();
        return session.recentJobs.find(j => j.id === jobId);
    }
};
