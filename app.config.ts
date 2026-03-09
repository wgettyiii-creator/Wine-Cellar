import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Wine Cellar',
  slug: 'wine-cellar',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  scheme: 'wine-cellar',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.williamgetty.winecellar',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'Wine Cellar uses your camera to scan wine labels.',
      NSLocationWhenInUseUsageDescription: 'Wine Cellar records where you tried a wine when dining out.',
    },
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-camera',
      { cameraPermission: 'Wine Cellar needs your camera to scan wine labels.' },
    ],
    [
      'expo-location',
      { locationWhenInUsePermission: 'Wine Cellar uses your location to record where you tried a wine.' },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: '46b64b2a-a386-47c6-8c46-146a0ee2eada' },
  },
};

export default config;
