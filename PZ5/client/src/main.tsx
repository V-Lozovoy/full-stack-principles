import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'

// StrictMode у dev навмисно викликає ефекти двічі — так React шукає ефекти,
// які не прибирають за собою. У прод-збірці цього немає.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
