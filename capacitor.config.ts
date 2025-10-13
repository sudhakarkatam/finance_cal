import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.appcal',
  appName: 'Financial Calculator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
