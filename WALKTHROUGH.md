# Walkthrough - Fix Tests

I have successfully completed the assigned tasks.

## Changes

### 1. Move Orphaned Test File
- Moved `src/apps/code-tracer/components/__tests__/CodeEditorHighlight.test.tsx` to `apps/web/src/apps/code-tracer/components/__tests__/CodeEditorHighlight.test.tsx`.
- Removed the orphaned `/src` directory.
- Updated the test file to match the current `CodeEditor.tsx` implementation (updated class names from `current-line-highlight` to `monaco-active-line`).

### 2. Fix Failing Dashboard Tests
- Modified `apps/web/src/pages/__tests__/Dashboard.test.tsx`:
    - Fixed relative paths in `vi.mock` calls (e.g., changed `../lib/supabase` to `../../lib/supabase`).
    - Mocked `../../config` to set `enableMockAuth: true`, ensuring deterministic behavior and skipping external dependencies.
    - Updated `useAuth` mock to return a stable object reference to prevent infinite `useEffect` loops in the component.
    - Wrapped assertions in `waitFor` to correctly handle the async loading state transition.

## Verification Results

### Test Output
```bash
> OKernel@1.1.0 test
> vitest --run

 RUN  v4.0.18 /Users/vaiditya/Desktop/PROJECTS/OKernel/apps/web

 ✓ src/apps/cpu-scheduler/tests/components/ProcessList.test.tsx (5 tests) 113ms
 ✓ src/apps/cpu-scheduler/tests/components/Cpu.test.tsx (4 tests) 190ms
 ✓ src/apps/code-tracer/components/__tests__/CodeEditorHighlight.test.tsx (2 tests) 326ms
 ✓ src/apps/cpu-scheduler/tests/components/Controls.test.tsx (8 tests) 261ms
 ✓ src/pages/__tests__/Dashboard.test.tsx (2 tests) 281ms
 ✓ src/pages/__tests__/Settings.test.tsx (5 tests) 240ms
 ✓ src/apps/code-tracer/components/__tests__/StatsView.test.tsx (5 tests) 258ms
 ✓ src/apps/cpu-scheduler/tests/components/ReadyQueue.test.tsx (4 tests) 50ms
 ✓ src/apps/code-tracer/components/__tests__/FlameGraph.test.tsx (5 tests) 64ms
 ✓ src/apps/cpu-scheduler/tests/Page.test.tsx (5 tests) 107ms
 ✓ src/syscore/terminal/commands.test.ts (9 tests) 5ms
 ✓ src/apps/code-tracer/components/__tests__/CodeEditor.test.tsx (1 test) 21ms
 ✓ src/apps/code-tracer/LandingPage.test.tsx (1 test) 46ms

 Test Files  13 passed (13)
      Tests  56 passed (56)
   Start at  16:10:37
   Duration  2.45s
```

All 56 tests passed, including the moved test file and the fixed Dashboard tests.
