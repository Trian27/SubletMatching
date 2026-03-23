import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { ListingsProvider } from './context/ListingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ListingsProvider>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </ListingsProvider>
  </StrictMode>,
)
