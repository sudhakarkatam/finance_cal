import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.easecraft.financialcalculator',
  appName: 'Financial Calculator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
