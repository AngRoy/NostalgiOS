// apps/web-os/src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { Desktop } from './components/Desktop'
import { bootOS } from './os/boot'
import './sw-register'
import { ModalProvider } from './ui/ModalProvider'
import { ErrorBoundary } from './ErrorBoundary'
import { initStore } from './state/store'       // <-- NEW

async function main(){
  console.log('[nostalgiOS] booting…')
  await initStore();                             // <-- NEW: no TLA, inside async function
  await bootOS();

  const rootEl = document.getElementById('root')!
  createRoot(rootEl).render(
    <ErrorBoundary>
      <ModalProvider>
        <Desktop />
      </ModalProvider>
    </ErrorBoundary>
  )
  console.log('[nostalgiOS] UI mounted')
}
main()
