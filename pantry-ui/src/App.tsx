import './index.css'
import { NavLink, Routes, Route, BrowserRouter } from 'react-router-dom'
import { FaThLarge, FaHome, FaBoxes, FaChartBar, FaComments, FaBullhorn, FaWrench, FaEnvelope } from 'react-icons/fa'
import Overview from './pages/Overview'
import StockManagement from './pages/StockManagement'
import Reports from './pages/Reports'
import Feedback from './pages/Feedback'
import Announcements from './pages/Announcements'
import AdminSettings from './pages/AdminSettings'
import Home from './pages/Home'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { snackRows } from './data/snacks'
import { getExpiryDays } from './utils/config'

export default function App() {
  const [role, setRole] = useState<'admin' | 'employee'>(() => (localStorage.getItem('role') as any) || 'admin')
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  useEffect(() => { localStorage.setItem('role', role) }, [role])
  const isAdmin = role === 'admin'
  const emailPreview = useMemo(() => {
    const threshold = getExpiryDays()
    const now = dayjs()
    const expiring = snackRows.filter(s => dayjs(s.expiry).diff(now, 'day') <= threshold)
    if (expiring.length > 0) {
      return {
        subject: `Pantry: Snacks expiring within ${threshold} days`,
        bodyLines: [
          `These snacks are expiring within ${threshold} days:`,
          ...expiring.map(s => `• ${s.name} — expiry ${dayjs(s.expiry).format('YYYY-MM-DD')} (current: ${s.current})`),
        ],
        threshold,
      }
    }
    // Professional sample when no items match
    const sampleDays = 14
    return {
      subject: `Pantry: Snacks expiring within ${sampleDays} days`,
      bodyLines: [
        `These snacks are expiring within ${sampleDays} days:`,
        `• Milo 3-in-1 Activgo — expiry 2025-10-10 (current: 12)`,
      ],
      threshold: sampleDays,
    }
  }, [])
  return (
    <BrowserRouter>
      <div className="role-bar">
        <span className="toggle-label">Employee</span>
        <button
          aria-label="Toggle role"
          className={`toggle ${role==='admin' ? 'on' : ''}`}
          onClick={() => setRole(role === 'admin' ? 'employee' : 'admin')}
        >
          <span className="knob" />
        </button>
        <span className="toggle-label">Admin</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowEmailPreview(true)} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'8px 12px', color:'#6b6b6b', display:'inline-flex', alignItems:'center', gap:8 }}>
          <FaEnvelope /> Preview Email
        </button>
      </div>
      <div className="browser-chrome">
        <div className="chrome-dots">
          <div className="chrome-dot"></div>
          <div className="chrome-dot"></div>
          <div className="chrome-dot"></div>
        </div>
        <div className="chrome-url"></div>
      </div>
      {showEmailPreview && (
        <div style={{ position:'fixed', inset:'90px 0 0 0', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width: 680, maxWidth: '92%' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ margin: 0, fontSize: 22, color:'#6e6e6e', fontWeight:600 }}>Expiry Notification (System Generated)</h3>
              <button onClick={() => setShowEmailPreview(false)} style={{ border:'none', background:'transparent', color:'#8a8a8a', padding:'4px 6px', fontSize:20, lineHeight:1 }}>×</button>
            </div>
            <div className="email-frame" style={{ marginTop: 10, border:'1px solid #e1e1e1', borderRadius:8, overflow:'hidden', background:'#fff' }}>
              <div style={{ background:'#f3f3f3', padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e1e1e1' }}>
                <div style={{ fontWeight: 600, color:'#555' }}>{emailPreview.subject}</div>
                <div style={{ color:'#888', fontSize:12 }}>{dayjs().format('YYYY-MM-DD HH:mm')}</div>
              </div>
              <div style={{ padding:'10px 12px', borderBottom:'1px solid #eeeeee', color:'#666' }}>
                <div><strong>From:</strong> Pantry Notifications <span style={{ color:'#999' }}>&lt;no-reply@orangeleaf.com.my&gt;</span></div>
                <div><strong>To:</strong> Admins <span style={{ color:'#999' }}>&lt;admins@orangeleaf.com.my&gt;</span></div>
              </div>
              <div style={{ padding:'16px 12px', color:'#555', whiteSpace:'pre-wrap' }}>
                {emailPreview.bodyLines.join('\n')}
                <div style={{ marginTop: 16, color:'#8a8a8a', fontSize:12 }}>This is an automated message. Please do not reply.</div>
              </div>
            </div>
          </div>
        </div>
      )}
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
