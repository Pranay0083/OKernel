# CI Workflows for PyPI Publishing

## Verification
Workflows created at:
- `.github/workflows/pypi-test.yml`
- `.github/workflows/pypi-prod.yml`

Files verified to contain:
- Correct triggers (`workflow_dispatch`, `push: develop`, `release: published`)
- Required steps (Checkout, Setup Python, Install, Test, Build, Upload)
- Correct secrets (`TEST_PYPI_API_TOKEN`, `PYPI_API_TOKEN`)
- Specified versions (`checkout@v4`, `setup-python@v5`)

## Changes
- Added `pypi-test.yml` for TestPyPI validation.
- Added `pypi-prod.yml` for Production PyPI release.

## Test Output
Since these are CI configuration files, local testing via `pytest` is not applicable to the files themselves. The workflows will trigger on the GitHub Actions runner.
