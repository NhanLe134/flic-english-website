// Load mock API only when explicitly enabled via Vite env `VITE_USE_MOCK`
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mockApi');
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
