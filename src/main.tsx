import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { ThemeToggle } from './components/theme-toggle.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<div className='p-4 top-0 right-0 fixed'>
				<ThemeToggle />
			</div>
    	<App />
		</ThemeProvider>
  </StrictMode>,
)
