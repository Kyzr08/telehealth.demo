import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupMocks } from './services/mockBackend.js'
import './index.css'
import App from './App.jsx'

setupMocks()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
