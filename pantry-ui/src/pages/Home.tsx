import { Link } from 'react-router-dom'

export default function Home() {
  const role = (localStorage.getItem('role') as 'admin' | 'employee') || 'admin'
  const isAdmin = role === 'admin'
  return (
    <>
      <div className="home-grid">
        {isAdmin && <Link to="/" className="home-card"><div className="home-card-title">Overview</div></Link>}
        {isAdmin && <Link to="/stock" className="home-card"><div className="home-card-title">Stock Management</div></Link>}
        {isAdmin && <Link to="/reports" className="home-card"><div className="home-card-title">Reports</div></Link>}
        <Link to="/feedback" className="home-card"><div className="home-card-title">Feedback & Polls</div></Link>
        <Link to="/announcements" className="home-card"><div className="home-card-title">Announcements</div></Link>
        {isAdmin && <Link to="/settings" className="home-card"><div className="home-card-title">Admin Settings</div></Link>}
      </div>
    </>
  )
}


