#!/usr/bin/env node
import chalk from 'chalk';
import { spawn } from 'child_process';

import { banner } from './utils';

// Define styles
const redTip = chalk.hex('#C70039'); // Red for tips

// Display banner unless disabled with --no-banner
if (!process.argv.includes('--no-banner')) {
  // eslint-disable-next-line no-console
  console.log(banner);
}

const TEMPLATE_URL =
  'https://github.com/reown-com/react-native-examples/tree/main/dapps/appkit-expo-wagmi';

function runExpoCreate(projectName?: string) {
  return new Promise<void>((resolve, reject) => {
    const args = ['create-expo', '--template', TEMPLATE_URL];
    if (projectName) {
      args.push(projectName);
    }

    const child = spawn('npx', args, {
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`create-expo exited with code ${code}`));
      }
    });
  });
}

export async function main() {
  try {
    const projectNameIndex = process.argv.findIndex(arg => arg === '--name');
    const projectName = projectNameIndex >= 0 ? process.argv[projectNameIndex + 1] : undefined;
    await runExpoCreate(projectName);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Failed to run Expo initializer:', error?.message || error);
    process.exitCode = 1;

    return;
  }

  const url = 'https://dashboard.reown.com';
  // eslint-disable-next-line no-console
  console.log(`Your ${redTip('Project Id')} will work only on the Expo Go environment`);
  // eslint-disable-next-line no-console
  console.log(`
Go to: ${url}
To create a personal ProjectId
`);
}

main();
