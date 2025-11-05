import React, { createContext, useContext, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { PaletteMode } from '@mui/material'

type Brand = 'sky' | 'emerald' | 'rose'

const BRAND_COLORS: Record<Brand, { primary: string; secondary: string }> = {
	sky: { primary: '#0ea5e9', secondary: '#8b5cf6' },
	emerald: { primary: '#10b981', secondary: '#06b6d4' },
	rose: { primary: '#e11d48', secondary: '#a78bfa' },
}

const STORAGE = {
	mode: 'snack-theme-mode',
	brand: 'snack-theme-brand',
}

const ThemeControls = createContext<{
	mode: PaletteMode
	brand: Brand
	setMode: (m: PaletteMode) => void
	setBrand: (b: Brand) => void
} | null>(null)

export function useThemeControls() {
	const ctx = useContext(ThemeControls)
	if (!ctx) throw new Error('Theme not ready')
	return ctx
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
	const [mode, setMode] = useState<PaletteMode>(() => (localStorage.getItem(STORAGE.mode) as PaletteMode) || 'light')
	const [brand, setBrand] = useState<Brand>(() => (localStorage.getItem(STORAGE.brand) as Brand) || 'sky')

	const theme = useMemo(() => {
		const colors = BRAND_COLORS[brand]
		return createTheme({
			palette: {
				mode,
				primary: { main: colors.primary },
				secondary: { main: colors.secondary },
				...(mode === 'dark' ? { background: { default: '#0b1220', paper: '#0f172a' } } : {}),
			},
			shape: { borderRadius: 12 },
			typography: { fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' },
			components: {
				MuiAppBar: { styleOverrides: { root: { backdropFilter: 'saturate(120%) blur(8px)', backgroundColor: mode === 'dark' ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.8)' } } },
				MuiCard: { styleOverrides: { root: { borderRadius: 16, border: '1px solid', borderColor: mode === 'dark' ? '#1f2a44' : '#eaeaea' } } },
				MuiButton: { defaultProps: { disableElevation: true } },
			},
		})
	}, [mode, brand])

	const controls = useMemo(() => ({
		mode,
		brand,
		setMode: (m: PaletteMode) => { setMode(m); localStorage.setItem(STORAGE.mode, m) },
		setBrand: (b: Brand) => { setBrand(b); localStorage.setItem(STORAGE.brand, b) },
	}), [mode, brand])

	return (
		<ThemeControls.Provider value={controls}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ThemeControls.Provider>
	)
}


