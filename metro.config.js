const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Gradle build outputs inside node_modules contain paths that crash
// Metro's file watcher on Windows (e.g. expo-modules-core/android/build).
config.resolver.blockList = [
  /.*\/android\/build\/.*/,
  /.*\/android\/\.gradle\/.*/,
];

module.exports = config;
