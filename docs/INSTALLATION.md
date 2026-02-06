# The Hacker's Guide to OKernel

> **Welcome, Contributor.**
> This guide is not just about "installing" the app. It's about setting up your workspace to modify the laws of our simulated physics.

---

## 1. The Pre-Flight Check

Before you clone, ensure your machine is flight-ready.

-   **Node.js Runtime**: We require **Node v18+**. (We use modern fetch APIs).
-   **Package Manager**: **npm** (v9+) or **pnpm** (preferred for speed).
-   **IDE**: VS Code is highly recommended.
    -   *Recommended Extensions*: ESLint, Prettier, Tailwind CSS IntelliSense.

---

## 2. Liftoff (Installation)

### Step 1: Clone the Frequency
```bash
git clone https://github.com/Vaiditya2207/cpu-scheduler-visualizer.git
cd cpu-scheduler-visualizer
```

### Step 2: Hydrate Dependencies
We use a lot of specific type definitions for our VM.
```bash
npm install
# or
pnpm install
```

### Step 3: Environment Secrets
You cannot talk to the Cloud (Supabase) without the keys.

1.  **Duplicate** the `.env.example`:
    ```bash
    cp .env.example .env
    ```
2.  **Populate Variables**:
    -   `VITE_SUPABASE_URL`: The endpoint of our Postgres instance.
    -   `VITE_SUPABASE_ANON_KEY`: The public API key.
    
    > *Asking for keys?* If you are a core team member, ping the Discord. If you are open-source, you can create your OWN Supabase project (Free Tier) and use those keys! The app creates tables automatically.

---

## 3. The Development Loop

### Start the Kernel
```bash
npm run dev
```
-   **Port**: `5173` (Default)
-   **Hot Reload**: Enabled.
-   **SysCore Debug**: Enabled (Check Console).

### Running the Test Suite
We take stability seriously. The Kernel must not panic.

```bash
# Run Unit Tests (SysCore logic)
npm test

# Run UI Integration Tests
npm run test:ui
```

**Key Test Files:**
-   `src/syscore/vm/Transpiler.test.ts`: Ensures C code compiles correctly.
-   `src/syscore/vm/Memory.test.ts`: Ensures Pointer loops don't crash.

---

## 4. Contributing Guidelines

### The "Visionary" Code Style
We don't just write code that works. We write code that explains itself.

1.  **No Magic Numbers**: Don't use `1048576`. Use `Memory.SIZE`.
2.  **Strict Typing**: `any` is forbidden. Define an interface.
3.  **Comments**: Comment *why*, not *what*.
    -   BAD: `// Increment i`
    -   GOOD: `// Advance stack pointer by 4 bytes (32-bit integer)`

### Pull Request Protocol
1.  **Fork** the repo.
2.  **Branch** off `main`: `git checkout -b feature/quantum-entanglement`.
3.  **Commit**: Use Conventional Commits (`feat: add quantum scheduler`).
4.  **Verify**: Run `npm test` before pushing.
5.  **Description**: Write a poem... or just a detailed description of your changes.

---

## 5. Troubleshooting (Kernel Panic Recovery)

### "Module not found: Can't resolve..."
-   Did you modify `tsconfig.json`? We use specific path aliases.
-   Try: `rm -rf node_modules package-lock.json && npm install`

### "Supabase Error: Policy Violation"
-   You are trying to write to the `system_config` table.
-   Only Admins can do that. Check your User Role in the database or disable RLS locally.

### "The Simulator is Freezing!"
-   You likely wrote an infinite loop in the Scheduler without a `yield`.
-   **Fix**: Ensure your `while` loop checks `performance.now()` and breaks if it exceeds 16ms.

---

## 6. Project Structure (The Map)

-   `src/syscore`: **The Engine Room**. Touch this with caution.
-   `src/pages`: **The Dashboard**. React components live here.
-   `src/components/ui`: **The Control Panel**. Buttons, knobs, sliders.
-   `src/assets`: **The Paint**. Images and static fonts.

Go forth and build.
