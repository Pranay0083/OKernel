import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Parse arguments
const args = process.argv.slice(2);
const releaseType = args[0]; // major, minor, patch, or specific version

if (!releaseType) {
  console.error('Usage: bun run apps/web/scripts/bump_version.ts <major|minor|patch|version>');
  process.exit(1);
}

const packageJsonPath = join(process.cwd(), 'apps/web/package.json');
const versionFilePath = join(process.cwd(), 'apps/web/src/version.ts');

// Helper to run command
function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', shell: true });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function main() {
  console.log(`Bumping version: ${releaseType}...`);

  // 1. Update package.json using npm version
  // We run this in apps/web directory
  try {
    await run(`cd apps/web && npm version ${releaseType} --no-git-tag-version`, []);
  } catch (error) {
    console.error('Failed to bump version:', error);
    process.exit(1);
  }

  // 2. Read new version from package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const newVersion = packageJson.version;
  console.log(`New version: ${newVersion}`);

  // 3. Update src/version.ts
  let versionFileContent = readFileSync(versionFilePath, 'utf-8');

  // Replace APP_VERSION
  // Regex to match: export const APP_VERSION = '...';
  versionFileContent = versionFileContent.replace(
    /export const APP_VERSION = '.*';/,
    `export const APP_VERSION = '${newVersion}';`
  );

  writeFileSync(versionFilePath, versionFileContent);
  console.log(`Updated src/version.ts to ${newVersion}`);

  console.log('Done! Please review changes and commit.');
}

main();
