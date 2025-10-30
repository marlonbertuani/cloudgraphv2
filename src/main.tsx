import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DashboardMetrics from './pages/DashboardMetrics'


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardMetrics />
  </React.StrictMode>
)