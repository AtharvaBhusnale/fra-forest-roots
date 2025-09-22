import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3a9d07a3f7da439ab947502d43b8adb3',
  appName: 'fra-forest-roots',
  webDir: 'dist',
  server: {
    url: 'https://3a9d07a3-f7da-439a-b947-502d43b8adb3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;