/// <reference types="vitest" />
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In dev, load .env from monorepo root; in production (Vercel), use injected env vars
  envDir: process.env.VERCEL ? undefined : path.resolve(__dirname, '../..'),
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
} as UserConfig & { test: unknown })
