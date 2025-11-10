import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <div className="home-grid">
        <Link to="/" className="home-card"><div className="home-card-title">Overview</div></Link>
        <Link to="/stock" className="home-card"><div className="home-card-title">Stock Management</div></Link>
        <Link to="/reports" className="home-card"><div className="home-card-title">Reports</div></Link>
        <Link to="/feedback" className="home-card"><div className="home-card-title">Feedback & Polls</div></Link>
        <Link to="/announcements" className="home-card"><div className="home-card-title">Announcements</div></Link>
        <Link to="/settings" className="home-card"><div className="home-card-title">Admin Settings</div></Link>
      </div>
    </>
  )
}


