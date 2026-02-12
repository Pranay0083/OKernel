import axios from 'axios';

import { config } from '../config';

const API_BASE = `${config.apiUrl}/api`;

export interface ExecuteResponse {
    status: string;
    output: string; // This is the Job ID
}

export const sysCoreApi = {
    checkHealth: async (): Promise<boolean> => {
        try {
            const res = await axios.get(`${config.apiUrl}/health`);
            return res.status === 200;
        } catch {
            return false;
        }
    },

    execute: async (language: 'python' | 'cpp', code: string, input?: string): Promise<string> => {
        const res = await axios.post<ExecuteResponse>(`${API_BASE}/execute`, {
            language,
            code,
            input: input || ""
        });
        if (res.data.status === 'success') {
            return res.data.output; // Job ID
        }
        throw new Error(res.data.output);
    }
};
