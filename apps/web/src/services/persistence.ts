
export interface JobRecord {
    id: string;
    timestamp: number;
    code: string;
    language: 'python' | 'cpp';
    status: 'success' | 'failed';
    duration: number; // ms
    input?: string;
}

export interface EditorConfig {
    fontSize: number;
    minimap: boolean;
    wordWrap: boolean;
    readOnly: boolean;
    vimMode: boolean; // Future proofing
    autoComplete: boolean;
}

export interface UserSession {
    userId: string;
    email?: string; // Add email support
    theme: 'dark' | 'light';
    recentJobs: JobRecord[];
    favoriteJobs: string[]; // IDs
    editorConfig: EditorConfig;
}

const STORAGE_KEY = 'okernel_user_session_v1';

const DEFAULT_EDITOR_CONFIG: EditorConfig = {
    fontSize: 14,
    minimap: false,
    wordWrap: false,
    readOnly: false,
    vimMode: false,
    autoComplete: true
};

export const Persistence = {
    // Initialize or Load Session
    getSession: (): UserSession => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const session = JSON.parse(raw);
                
                // MIGRATION: Add Editor Config if missing
                if (!session.editorConfig) {
                    session.editorConfig = { ...DEFAULT_EDITOR_CONFIG };
                }

                // Save the update (migrations)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
                
                return session;
            } catch (e) {
                console.error('Failed to parse session', e);
            }
        }

        // Default Session
        const newSession: UserSession = {
            userId: 'user_' + Math.random().toString(36).substring(2, 9),
            theme: 'dark',
            editorConfig: { ...DEFAULT_EDITOR_CONFIG },
            recentJobs: [],
            favoriteJobs: []
        };
        Persistence.saveSession(newSession);
        return newSession;
    },

    saveSession: (session: UserSession) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        // Trigger event for cross-component updates
        window.dispatchEvent(new Event('okernel-session-update'));
    },

    updateEditorConfig: (config: Partial<EditorConfig>) => {
        const session = Persistence.getSession();
        session.editorConfig = { ...session.editorConfig, ...config };
        Persistence.saveSession(session);
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
