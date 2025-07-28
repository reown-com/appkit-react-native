// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the workspace root, this can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Force react native entry point for web platform
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@walletconnect/ethereum-provider') {
    const nativePath = path.resolve(
      workspaceRoot,
      'node_modules/@walletconnect/ethereum-provider/dist/index.native.js'
    );
    
    return {
      type: 'sourceFile',
      filePath: nativePath,
    };
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
