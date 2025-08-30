// apps/web-os/src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Desktop } from './components/Desktop';
import { bootOS } from './os/boot';
import './sw-register';
import { ModalProvider } from './ui/ModalProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { initStore } from './state/store';

const rootEl = document.getElementById('root')!;
const root = createRoot(rootEl);

// A simple splash component to show while the store is initializing
function Splash() {
  return (
    <div style={{
      display: 'grid',
      placeItems: 'center',
      height: '100vh',
      color: 'var(--text)',
      background: 'var(--bg)',
      fontFamily: '"Press Start 2P", system-ui, sans-serif', // Using your app's font
      textAlign: 'center'
    }}>
      <div>
        <div style={{ opacity: 0.7, fontSize: 14, letterSpacing: 1 }}>nostalgiOS</div>
        <div style={{ marginTop: 12, fontSize: 12 }}>Starting desktop…</div>
      </div>
    </div>
  );
}

// 1. Render the splash screen immediately to avoid a blank page
root.render(<Splash />);

// 2. Initialize the store and boot the OS, then render the main app
(async () => {
  console.log('[nostalgiOS] booting…');
  try {
    await initStore();
    await bootOS();
  } catch (e) {
    // If something goes wrong, log it but continue so the user isn't stuck
    console.error('Initialization failed; continuing with a fresh state.', e);
  }

  // Wait for 0.5 seconds before showing the main UI
  setTimeout(() => {
    // 3. Replace the splash screen with the fully-loaded application
    root.render(
      <ErrorBoundary>
        <ModalProvider>
          <Desktop />
        </ModalProvider>
      </ErrorBoundary>
    );
    console.log('[nostalgiOS] UI mounted');
  }, 500);
})();