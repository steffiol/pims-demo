import { AppBar, Box, Button, Container, Divider, IconButton, Menu, MenuItem, Toolbar, Typography, Chip, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InventoryIcon from '@mui/icons-material/Inventory'
import EditIcon from '@mui/icons-material/Edit'
import ForumIcon from '@mui/icons-material/Forum'
import AssessmentIcon from '@mui/icons-material/Assessment'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import PaletteIcon from '@mui/icons-material/Palette'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import React, { Suspense, useMemo, useState, lazy } from 'react'
import { AppStateProvider } from './store'
import { useThemeControls } from './theme'
import { ErrorBoundary } from './components/ErrorBoundary'
import AllDashboard from './views/AllDashboard'
import Feedback from './views/Feedback'
const PantryStation = lazy(() => import('./views/PantryStation'))
import AdminDashboard from './views/AdminDashboard'
const TopUp = lazy(() => import('./views/TopUp'))
const EditQuantity = lazy(() => import('./views/EditQuantity'))
const ConsumptionLog = lazy(() => import('./views/ConsumptionLog'))
const MonthlyReport = lazy(() => import('./views/MonthlyReport'))

function useRole() {
	const [role, setRole] = useState<'admin' | 'employee'>(
		(() => (localStorage.getItem('role') as 'admin' | 'employee') || 'employee')()
	)
	const toggleRole = () => {
		const next = role === 'admin' ? 'employee' : 'admin'
		setRole(next)
		localStorage.setItem('role', next)
	}
	return { role, toggleRole }
}

function TopBar() {
	const { role, toggleRole } = useRole()
	const nav = useNavigate()
	const location = useLocation()
	const [anchor, setAnchor] = useState<null | HTMLElement>(null)
	const open = Boolean(anchor)
    const { mode, setMode, brand, setBrand } = useThemeControls()
	const title = useMemo(() => {
		if (location.pathname.startsWith('/admin')) return 'Admin Portal'
		return 'Pantry Experience'
	}, [location.pathname])
	return (
		<AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
			<Toolbar>
				<IconButton edge="start" onClick={(e) => setAnchor(e.currentTarget)}>
					<MenuIcon />
				</IconButton>
				<Menu open={open} anchorEl={anchor} onClose={() => setAnchor(null)}>
					<MenuItem onClick={() => { setAnchor(null); nav('/') }}><DashboardIcon sx={{ mr: 1 }} /> All View Dashboard</MenuItem>
					<MenuItem onClick={() => { setAnchor(null); nav('/feedback') }}><ForumIcon sx={{ mr: 1 }} /> Feedback & Suggestion</MenuItem>
					<Divider />
					<MenuItem onClick={() => { setAnchor(null); nav('/admin') }} disabled={role !== 'admin'}><AssessmentIcon sx={{ mr: 1 }} /> Admin Dashboard</MenuItem>
					<MenuItem onClick={() => { setAnchor(null); nav('/admin/topup') }} disabled={role !== 'admin'}><InventoryIcon sx={{ mr: 1 }} /> Top Up Snacks</MenuItem>
					<MenuItem onClick={() => { setAnchor(null); nav('/admin/edit') }} disabled={role !== 'admin'}><EditIcon sx={{ mr: 1 }} /> Edit Snack Quantity</MenuItem>
					<MenuItem onClick={() => { setAnchor(null); nav('/admin/logs') }} disabled={role !== 'admin'}><AssessmentIcon sx={{ mr: 1 }} /> Consumption Log</MenuItem>
					<MenuItem onClick={() => { setAnchor(null); nav('/admin/report') }} disabled={role !== 'admin'}><AssessmentIcon sx={{ mr: 1 }} /> Monthly Report</MenuItem>
					<Divider />
                    <MenuItem onClick={() => { setAnchor(null); nav('/pantry') }} disabled={role !== 'admin'}><QrCodeScannerIcon sx={{ mr: 1 }} /> Pantry Auto Counter</MenuItem>
				</Menu>
				<Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>{title}</Typography>
				<Box sx={{ flexGrow: 1 }} />
                <Stack direction="row" spacing={1} alignItems="center">
					<Chip label={role === 'admin' ? 'Admin' : 'Employee'} color={role === 'admin' ? 'secondary' : 'default'} variant={role === 'admin' ? 'filled' : 'outlined'} />
					<Button onClick={toggleRole} variant="contained" size="small">Switch</Button>
                    <ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, v) => v && setMode(v)}>
                        <ToggleButton value="light"><LightModeIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="dark"><DarkModeIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButtonGroup exclusive size="small" value={brand} onChange={(_, v) => v && setBrand(v)}>
                        <ToggleButton value="sky"><PaletteIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="emerald"><PaletteIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="rose"><PaletteIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
				</Stack>
			</Toolbar>
		</AppBar>
	)
}

function Placeholder({ title, children }: { title: string, children?: React.ReactNode }) {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>{title}</Typography>
			<Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
				{children ?? <Typography color="text.secondary">Coming soon in this demo section.</Typography>}
			</Box>
		</Container>
	)
}

export default function App() {
    return (
        <AppStateProvider>
            <Box sx={{ minHeight: '100dvh', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 60%)' }}>
                <TopBar />
                <ErrorBoundary fallback={<Container maxWidth="lg" sx={{ py: 6 }}><Typography variant="h6">Something went wrong. Try refreshing.</Typography></Container>}>
                <Suspense fallback={<Container maxWidth="lg" sx={{ py: 6 }}><Typography variant="h6">Loading…</Typography></Container>}>
                <Routes>
                    <Route path="/" element={<AllDashboard />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/pantry" element={<AdminOnly><PantryStation /></AdminOnly>} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/topup" element={<TopUp />} />
                    <Route path="/admin/edit" element={<EditQuantity />} />
                    <Route path="/admin/logs" element={<ConsumptionLog />} />
                    <Route path="/admin/report" element={<MonthlyReport />} />
                    <Route path="*" element={<Placeholder title="Not Found"><Typography>Use the menu to navigate.</Typography></Placeholder>} />
                </Routes>
                </Suspense>
                </ErrorBoundary>
            </Box>
        </AppStateProvider>
    )
}

function AdminOnly({ children }: { children: React.ReactNode }) {
    const role = ((typeof window !== 'undefined' && localStorage.getItem('role')) as 'admin' | 'employee') || 'employee'
    if (role !== 'admin') {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Typography variant="h6">Restricted</Typography><Typography color="text.secondary">Admin only feature.</Typography></Container>
    }
    return <>{children}</>
}


