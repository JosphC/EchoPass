const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

module.exports = {
  expo: {
    name: 'EchoPass',
    slug: 'echopass-app',
    version: '0.1.0',
    orientation: 'portrait',
    scheme: 'echopass',
    userInterfaceStyle: 'automatic',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'ro.echopass.app',
      icon: './assets/icon.png',
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          'EchoPass detectează autobuzul din apropiere prin Bluetooth pentru check-in automat.',
        NSMicrophoneUsageDescription:
          'Microfonul este folosit 3 secunde pentru a confirma prezența în autobuz printr-un cod ultrasonic. Nu se înregistrează vocea.',
        NSUserNotificationUsageDescription: 'EchoPass trimite notificări de plată, sosiri și alerte de trafic.',
        NSLocationWhenInUseUsageDescription: 'EchoPass îți arată poziția pe hartă lângă autobuzele live.',
      },
    },
    android: {
      package: 'ro.echopass.app',
      icon: './assets/icon.png',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      permissions: ['BLUETOOTH_SCAN', 'BLUETOOTH_CONNECT', 'RECORD_AUDIO', 'POST_NOTIFICATIONS', 'ACCESS_FINE_LOCATION'],
      config: {
        googleMaps: { apiKey: mapsKey },
      },
    },
    extra: {
      mapsKey,
      eas: {
        projectId: '0a4cc337-e293-4147-a867-7e2fca9b5959',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-localization', 'expo-dev-client'],
  },
};
