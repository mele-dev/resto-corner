const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Asegurar que resuelva correctamente los archivos de entrada
config.resolver.sourceExts.push('js', 'jsx', 'json', 'ts', 'tsx');
config.watchFolders = [path.resolve(__dirname)];

// Resolver react-native-maps a un stub en web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    // Resolver a nuestro stub para web
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'utils', 'maps.web.js'),
    };
  }
  // Usar la resolución por defecto para otros módulos
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
