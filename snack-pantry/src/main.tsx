import React from 'react'
import ReactDOM from 'react-dom/client'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppThemeProvider } from './theme'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<AppThemeProvider>
			<SnackbarProvider maxSnack={3} autoHideDuration={3000}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</SnackbarProvider>
		</AppThemeProvider>
	</React.StrictMode>
)


