import './index.css'
import { NavLink, Routes, Route, BrowserRouter } from 'react-router-dom'
import { FaThLarge, FaHome, FaBoxes, FaChartBar, FaComments, FaBullhorn, FaWrench } from 'react-icons/fa'
import Overview from './pages/Overview'
import StockManagement from './pages/StockManagement'
import Reports from './pages/Reports'
import Feedback from './pages/Feedback'
import Announcements from './pages/Announcements'
import AdminSettings from './pages/AdminSettings'
import Home from './pages/Home'
import { useEffect, useState } from 'react'

export default function App() {
  const [role, setRole] = useState<'admin' | 'employee'>(() => (localStorage.getItem('role') as any) || 'admin')
  useEffect(() => { localStorage.setItem('role', role) }, [role])
  const isAdmin = role === 'admin'
  return (
    <BrowserRouter>
      <div className="role-bar">
        <div className="seg">
          <button className={role==='employee' ? 'active' : ''} onClick={() => setRole('employee')}>Employee</button>
          <button className={role==='admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button>
        </div>
      </div>
      <div className="browser-chrome">
        <div className="chrome-dots">
          <div className="chrome-dot"></div>
          <div className="chrome-dot"></div>
          <div className="chrome-dot"></div>
        </div>
        <div className="chrome-url"></div>
      </div>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">&nbsp;</div>
          <ul className="nav">
            <NavLink to="/home"><FaHome /> Home</NavLink>
            {isAdmin && <NavLink to="/" end><FaThLarge /> Overview</NavLink>}
            {isAdmin && <NavLink to="/stock"><FaBoxes /> Stock Management</NavLink>}
            {isAdmin && <NavLink to="/reports"><FaChartBar /> Reports</NavLink>}
            <NavLink to="/feedback"><FaComments /> Feedback & Polls</NavLink>
            <NavLink to="/announcements"><FaBullhorn /> Announcements</NavLink>
            {isAdmin && <NavLink to="/settings"><FaWrench /> Admin Settings</NavLink>}
          </ul>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Overview />} />
            <Route path="/stock" element={<StockManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
