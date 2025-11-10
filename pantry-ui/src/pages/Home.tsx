import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <div className="home-grid">
        <Link to="/" className="home-card"><div className="title">Overview</div></Link>
        <Link to="/stock" className="home-card"><div className="title">Stock Management</div></Link>
        <Link to="/reports" className="home-card"><div className="title">Reports</div></Link>
        <Link to="/feedback" className="home-card"><div className="title">Feedback & Polls</div></Link>
        <Link to="/announcements" className="home-card"><div className="title">Announcements</div></Link>
        <Link to="/settings" className="home-card"><div className="title">Admin Settings</div></Link>
      </div>
    </>
  )
}


