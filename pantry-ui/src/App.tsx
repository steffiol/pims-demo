import './index.css'
import { NavLink, Routes, Route, BrowserRouter } from 'react-router-dom'
import { FaHome, FaBoxes, FaChartBar, FaComments, FaBullhorn, FaWrench } from 'react-icons/fa'
import Overview from './pages/Overview'
import StockManagement from './pages/StockManagement'
import Reports from './pages/Reports'
import Feedback from './pages/Feedback'
import Announcements from './pages/Announcements'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">&nbsp;</div>
          <ul className="nav">
            <NavLink to="/" end><FaHome /> Overview</NavLink>
            <NavLink to="/stock"><FaBoxes /> Stock Management</NavLink>
            <NavLink to="/reports"><FaChartBar /> Reports</NavLink>
            <NavLink to="/feedback"><FaComments /> Feedback & Polls</NavLink>
            <NavLink to="/announcements"><FaBullhorn /> Announcements</NavLink>
          </ul>
          <div style={{ position: 'absolute', bottom: 24, left: 12, right: 12, color: '#8a8a8a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaWrench /> Admin Settings
          </div>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/stock" element={<StockManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/announcements" element={<Announcements />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
