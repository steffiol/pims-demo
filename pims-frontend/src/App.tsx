import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Snacks from './pages/Snacks'
import ImportExport from './pages/ImportExport'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AuditLog from './pages/AuditLog'
import Access from './pages/Access'
import Scanner from './pages/Scanner'
import { useSettingsStore } from './store/settingsStore'
import { Result } from 'antd'
import Notifications from './pages/Notifications'

function App() {
  const role = useSettingsStore(s => s.role)
  const RequireAdmin = (el: JSX.Element) => (role === 'admin' ? el : <Result status="403" title="Forbidden" subTitle="Admins only" />)
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/snacks" element={<Snacks />} />
        <Route path="/import" element={RequireAdmin(<ImportExport />)} />
        <Route path="/reports" element={RequireAdmin(<Reports />)} />
        <Route path="/settings" element={RequireAdmin(<Settings />)} />
        <Route path="/audit" element={RequireAdmin(<AuditLog />)} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/access" element={<Access />} />
        <Route path="/scanner" element={<Scanner />} />
      </Routes>
    </AppLayout>
  )
}

export default App
