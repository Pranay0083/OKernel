# PLAN.md — Repository Restructure

## Current State

The repository has grown organically and now contains three distinct projects mixed together:

```
OKernel/                          # CURRENT (Messy)
├── src/                          # React frontend
├── syscore/                      # Rust backend  
├── okernel/                      # Python package
├── sql/                          # Database
├── scripts/                      # Mixed scripts
├── *.py, *.html, *.tsx           # Random files at root
├── package.json                  # Node config
├── pyproject.toml                # Python config
├── Cargo.toml (in syscore/)      # Rust config
└── (everything mixed)
```

**Problems:**
1. Unclear what each directory contains
2. Three languages/ecosystems at root level
3. Test/demo files polluting root
4. Hard to onboard contributors
5. CI/CD paths are confusing

---

## Proposed Structure

```
OKernel/                          # PROPOSED (Clean Monorepo)
│
├── .github/
│   └── workflows/
│       ├── frontend.yml          # Website CI/CD
│       ├── pypi-test.yml         # ✅ DONE - TestPyPI
│       └── pypi-prod.yml         # ✅ DONE - PyPI
│
├── apps/
│   └── web/                      # React Website + Visualizer
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── apps/visualizer/
│       │   └── ...
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── tsconfig.json
│
├── packages/
│   └── okernel/                  # Python Package (PyPI)
│       ├── okernel/
│       │   ├── __init__.py
│       │   ├── syscore/
│       │   ├── visualizer/
│       │   └── tests/
│       ├── pyproject.toml
│       └── README.md
│
├── engine/                       # Rust Backend (SysCore)
│   ├── src/
│   ├── docker/
│   ├── Cargo.toml
│   └── README.md
│
├── database/                     # SQL Migrations
│   └── migrations/
│       └── *.sql
│
├── docs/                         # Documentation
│   ├── architecture.md
│   ├── getting-started.md
│   └── images/
│
├── agents/                       # Swarm Orchestration (unchanged)
│   ├── AGENTS.md
│   ├── THEME.md
│   ├── SYSTEM.md
│   └── PLAN.md
│
├── scripts/                      # Build/deployment scripts
│   └── ...
│
├── README.md                     # Project overview
├── LICENSE
├── .gitignore
└── CONTRIBUTING.md               # How to contribute
```

---

## Migration Tasks

### Phase 1: Setup (No Breaking Changes)
| Task | Description | Risk |
|------|-------------|------|
| T1.1 | Create `apps/web/` directory | None |
| T1.2 | Create `packages/okernel/` directory | None |
| T1.3 | Create `engine/` directory | None |
| T1.4 | Create `database/` directory | None |

### Phase 2: Move Frontend
| Task | Description | Risk |
|------|-------------|------|
| T2.1 | Move `src/` → `apps/web/src/` | HIGH |
| T2.2 | Move `public/` → `apps/web/public/` | LOW |
| T2.3 | Move `index.html` → `apps/web/` | MEDIUM |
| T2.4 | Move `package.json` → `apps/web/` | HIGH |
| T2.5 | Move `vite.config.ts` → `apps/web/` | MEDIUM |
| T2.6 | Move `tailwind.config.js` → `apps/web/` | MEDIUM |
| T2.7 | Move `tsconfig*.json` → `apps/web/` | MEDIUM |
| T2.8 | Move `postcss.config.js` → `apps/web/` | LOW |
| T2.9 | Move `eslint.config.js` → `apps/web/` | LOW |
| T2.10 | Update Vercel config for new path | HIGH |

### Phase 3: Move Python Package
| Task | Description | Risk |
|------|-------------|------|
| T3.1 | Move `okernel/` → `packages/okernel/okernel/` | MEDIUM |
| T3.2 | Move `pyproject.toml` → `packages/okernel/` | MEDIUM |
| T3.3 | Update CI workflows for new path | LOW |

### Phase 4: Move Rust Engine
| Task | Description | Risk |
|------|-------------|------|
| T4.1 | Move `syscore/` → `engine/` | MEDIUM |
| T4.2 | Update Docker paths | HIGH |
| T4.3 | Update CI workflows | MEDIUM |

### Phase 5: Move Database
| Task | Description | Risk |
|------|-------------|------|
| T5.1 | Move `sql/` → `database/migrations/` | LOW |

### Phase 6: Cleanup
| Task | Description | Risk |
|------|-------------|------|
| T6.1 | Delete temp files: `*.py`, `*.html` at root | LOW |
| T6.2 | Delete backup files: `original_home.tsx`, `restored_footer.tsx` | LOW |
| T6.3 | Delete `okernel.egg-info/`, `dist/`, `build/` | LOW |
| T6.4 | Delete redundant venvs | LOW |
| T6.5 | Update `.gitignore` | LOW |

### Phase 7: Documentation
| Task | Description | Risk |
|------|-------------|------|
| T7.1 | Update root `README.md` with monorepo guide | LOW |
| T7.2 | Create `CONTRIBUTING.md` | LOW |
| T7.3 | Create `docs/architecture.md` | LOW |

### Phase 8: Verification
| Task | Description | Risk |
|------|-------------|------|
| T8.1 | Run frontend: `cd apps/web && npm run dev` | HIGH |
| T8.2 | Run Python tests: `cd packages/okernel && pytest` | MEDIUM |
| T8.3 | Build Rust: `cd engine && cargo build` | MEDIUM |
| T8.4 | Test CI workflows | MEDIUM |
| T8.5 | Test Vercel deployment | HIGH |

---

## Execution Strategy

**Option A: Big Bang (Not Recommended)**
- Do all moves in one PR
- Risk: If something breaks, hard to isolate

**Option B: Incremental (Recommended)**
1. Create feature branch: `feat/monorepo-restructure`
2. Move one component at a time
3. Test after each move
4. Commit each phase separately
5. PR review before merge

**Option C: Parallel Repositories (Alternative)**
- Keep current repo as-is
- Create new monorepo structure
- Migrate component by component
- Archive old repo when done

---

## Files to Delete (Cleanup)

```
# Temp/test files at root
manual_audit_test.py
manual_test.py
verify_xss.py
xss_test.py
xss_var_test.py
demo_final.html
test_visualizer.html
lint_errors.log
syscore.log

# Backup files
original_home.tsx
restored_footer.tsx

# Build artifacts (should be gitignored anyway)
okernel.egg-info/
dist/
build/

# Redundant venvs
venv/
.venv/
```

---

## CI Workflow Updates Needed

After restructure, update workflow paths:

### `pypi-test.yml` and `pypi-prod.yml`
```yaml
# Change paths filter
paths:
  - 'packages/okernel/**'

# Change working directory
defaults:
  run:
    working-directory: packages/okernel

# Change test command
run: python -m pytest okernel/tests/ -v
```

### `syscore-deploy.yml`
```yaml
# Update to use engine/ instead of syscore/
working-directory: engine
```

---

## Success Criteria

- [ ] `cd apps/web && npm run dev` works
- [ ] `cd apps/web && npm run build` works
- [ ] `cd packages/okernel && pip install -e .` works
- [ ] `cd packages/okernel && pytest` passes
- [ ] `cd engine && cargo build` works
- [ ] Vercel deployment works
- [ ] GitHub Actions pass
- [ ] PyPI publish workflow works
- [ ] No broken imports anywhere

---

## Awaiting Approval

Keith has prepared this plan. 

**To proceed with restructure, confirm:**
1. Which option: A (Big Bang) / B (Incremental) / C (Parallel)?
2. When to start?
3. Any directories to rename differently?

---

**CI Workflows Status:**
- ✅ `pypi-test.yml` - Created
- ✅ `pypi-prod.yml` - Created

**Next Action:** Add GitHub secrets (`TEST_PYPI_API_TOKEN`, `PYPI_API_TOKEN`)
