const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to run commands and handle errors
function runCommand(command, args, options) {
  console.log(
    `Executing: ${command} ${args.join(' ')} ${options && options.cwd ? `in ${options.cwd}` : ''}`
  );
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) {
    console.error(`Error executing ${command}:`, result.error);
    throw result.error;
  }
  if (result.status !== 0) {
    const message = `Command failed: ${command} ${args.join(' ')} exited with status ${
      result.status
    }`;
    console.error(message);
    throw new Error(message);
  }
  return result;
}

console.log('Starting initial package publishing process...');

let packagesToPublish = [];
const rootDir = process.cwd();

const packagesToExclude = ['@apps/native', '@apps/gallery', 'appkit-react-native'];

try {
  // Get workspace info using yarn workspaces list --json
  // Yarn v1 outputs newline-delimited JSON objects
  const rawOutput = execSync('yarn workspaces list --json', { encoding: 'utf8' });
  const lines = rawOutput
    .trim()
    .split('\n')
    .filter(line => line.trim() !== '');
  const workspacePackages = lines.map(line => JSON.parse(line));

  for (const pkgData of workspacePackages) {
    console.log(`[DEBUG] Processing workspace entry: ${JSON.stringify(pkgData)}`);

    // Skip the root package (identified by location '.') or any package without a defined location
    if (pkgData.location === '.' || !pkgData.location) {
      console.log(
        `[DEBUG] Skipping root or undefined location package: ${pkgData.name} at ${pkgData.location}`
      );
      continue;
    }

    // Skip excluded packages
    if (packagesToExclude.includes(pkgData.name)) {
      console.log(`Skipping excluded package: ${pkgData.name}`);
      continue;
    }

    const pkgName = pkgData.name;
    const pkgDir = path.resolve(rootDir, pkgData.location);

    // Check if package exists on npm
    console.log(`Checking NPM status for ${pkgName}...`);
    const npmViewResult = spawnSync('npm', ['view', pkgName, 'version'], { encoding: 'utf8' });

    // If npm view exits with 0 and has output, package exists.
    // Otherwise (non-zero exit or empty output), it likely doesn't.
    if (npmViewResult.status === 0 && npmViewResult.stdout && npmViewResult.stdout.trim() !== '') {
      console.log(
        `Package ${pkgName} (version: ${npmViewResult.stdout.trim()}) already exists on NPM. Skipping initial publish.`
      );
    } else {
      console.log(
        `Package ${pkgName} does not appear to exist on NPM or has no published versions.`
      );
      if (fs.existsSync(path.join(pkgDir, 'package.json'))) {
        const packageJsonContent = fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8');
        const parsedPackageJson = JSON.parse(packageJsonContent);
        console.log(
          `[DEBUG] package.json for ${pkgName}: private=${parsedPackageJson.private}, version=${parsedPackageJson.version}`
        ); // Added for debugging
        packagesToPublish.push({ name: pkgName, dir: pkgDir });
      } else {
        console.warn(`Skipping ${pkgName}: package.json not found in ${pkgDir}`);
      }
    }
  }
} catch (error) {
  console.error('Error processing workspace info or checking NPM status:', error.message);
  process.exit(1); // Critical error, exit
}

if (packagesToPublish.length === 0) {
  console.log('No new packages to publish initially.');
} else {
  console.log(
    `Found ${packagesToPublish.length} new package(s) to publish initially: ${packagesToPublish
      .map(p => p.name)
      .join(', ')}`
  );

  // Conditionally run changeset:prepublish if there are packages to publish
  if (packagesToPublish.length > 0) {
    console.log('New packages found. Running changeset:prepublish to build packages...');
    try {
      runCommand('yarn', ['run', 'changeset:prepublish']); // Assumes it runs from rootDir
      console.log('changeset:prepublish completed successfully.');
    } catch (prepublishError) {
      console.error('Failed to run changeset:prepublish:', prepublishError.message);
      process.exit(1); // Exit if build fails, as publishing would also fail
    }
  }
}

let hasPublishErrors = false;
for (const pkg of packagesToPublish) {
  console.log(`[DEBUG] Attempting to publish from list: ${JSON.stringify(pkg)}`); // Added for debugging
  console.log(`Attempting to publish ${pkg.name} from ${pkg.dir} with alpha tag...`);
  const packageJsonPath = path.join(pkg.dir, 'package.json');
  let originalPackageJson = '';
  try {
    originalPackageJson = fs.readFileSync(packageJsonPath, 'utf8');
    const parsedPackageJson = JSON.parse(originalPackageJson);

    if (parsedPackageJson.private === true) {
      console.log(`Package ${pkg.name} is private, skipping initial publish.`);
      continue; // Skip to the next package
    }

    console.log(`Temporarily setting version of ${pkg.name} to 0.0.1 for initial publish.`);
    parsedPackageJson.version = '0.0.1';
    fs.writeFileSync(packageJsonPath, JSON.stringify(parsedPackageJson, null, 2));

    runCommand('yarn', ['npm', 'publish', '--access', 'public', '--tag', 'alpha'], {
      cwd: pkg.dir
    });
    // console.log(
    //   `DRY RUN: Would publish ${pkg.name} from ${pkg.dir} with version 0.0.1 and alpha tag.`
    // );
    // console.log(
    //   `DRY RUN: Command would be: yarn npm publish --access public --tag alpha (in ${pkg.dir})`
    // );
  } catch (publishError) {
    // runCommand already logs error details if it's from there
    console.error(`Failed to publish ${pkg.name}: ${publishError.message}`);
    hasPublishErrors = true; // Mark that an error occurred but continue trying other packages
  } finally {
    // Restore original package.json
    if (originalPackageJson) {
      console.log(`Restoring original package.json for ${pkg.name}.`);
      try {
        fs.writeFileSync(packageJsonPath, originalPackageJson);
      } catch (restoreError) {
        console.error(
          `CRITICAL: Failed to restore original package.json for ${pkg.name}: ${restoreError.message}`
        );
        // This is a more critical error, as it leaves the repo in a modified state.
        // Depending on desired behavior, you might want to ensure this error is highly visible
        // or even causes the entire workflow to fail more loudly.
        hasPublishErrors = true; // Ensure the overall process is marked as failed.
      }
    }
  }
}

console.log('Initial package publishing process finished.');
if (hasPublishErrors) {
  console.error('One or more packages failed during initial publishing.');
  process.exit(1); // Exit with error if any package failed to publish
}
