# WALKTHROUGH - Packaging Fix for template.html

## Task: Fix Missing template.html in okernel Package

### Verification
- Confirmed `okernel/visualizer/template.html` exists in source.
- Reproduced packaging issue where non-Python files were excluded by default `setuptools` config.

### Implementation Changes

1. **Packaging Config (`pyproject.toml`)**
   - Added `[tool.setuptools.package-data]` section.
   - Explicitly included `okernel = ["visualizer/*.html"]`.
   - Bumped version from `0.1.1` to `0.1.2`.

2. **Source Code (`okernel/visualizer/renderer.py`)**
   - Updated template path resolution to use standard `pathlib.Path`.
   - Replaced `os.path` logic with `Path(__file__).parent / "template.html"` which is robust for installed packages.

3. **Version Bump (`okernel/__init__.py`)**
   - Updated `__version__` to `0.1.2`.

### Testing & Verification

1. **Local Install Test**
   - Installed via `pip install -e .`
   - Ran script: `from okernel import trace; t = trace('print(1)'); t.to_html('/tmp/test.html')`
   - Verified output file `/tmp/test.html` was created successfully.

2. **Build Verification**
   - Built distribution: `python3 -m build`
   - Inspected wheel content: `unzip -l dist/okernel-0.1.2-py3-none-any.whl | grep html`
   - Confirmed presence of `okernel/visualizer/template.html`.

### Final Status
- Bug Fixed: `template.html` is now correctly packaged and accessible.
- Version: `0.1.2` ready for release.
