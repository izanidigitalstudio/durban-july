import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.title = 'Durban July VIP Guide 2026 | Marquees, Events & Concierge';

  const viewport = document.querySelector('meta[name="viewport"]');
  viewport?.setAttribute(
    'content',
    'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content'
  );

  const style = document.createElement('style');
  style.id = 'mobile-viewport-fix';
  style.textContent = `
    html, body, #root {
      width: 100%;
      width: 100vw;
      min-height: 100%;
      min-height: 100dvh;
      height: 100dvh;
      max-width: none;
      margin: 0;
      background: #0B0B0F;
      overscroll-behavior: none;
    }

    body {
      position: fixed;
      inset: 0;
    }

    #root {
      min-width: 0;
      overflow: hidden;
      display: flex;
      position: fixed;
      inset: 0;
    }

    #root > div {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      flex: 1 1 auto;
    }

  `;
  document.head.appendChild(style);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
