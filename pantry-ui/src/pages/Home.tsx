import { Link } from 'react-router-dom'
import { FaHome, FaBoxes, FaChartBar, FaComments, FaBullhorn, FaWrench } from 'react-icons/fa'

export default function Home() {
  return (
    <>
      <h1 className="title" style={{ marginBottom: 16 }}>Home</h1>
      <div className="home-grid">
        <Link to="/" className="home-card"><FaHome /> <div className="title">Overview</div></Link>
        <Link to="/stock" className="home-card"><FaBoxes /> <div className="title">Stock Management</div></Link>
        <Link to="/reports" className="home-card"><FaChartBar /> <div className="title">Reports</div></Link>
        <Link to="/feedback" className="home-card"><FaComments /> <div className="title">Feedback & Polls</div></Link>
        <Link to="/announcements" className="home-card"><FaBullhorn /> <div className="title">Announcements</div></Link>
        <Link to="/settings" className="home-card"><FaWrench /> <div className="title">Admin Settings</div></Link>
      </div>
    </>
  )
}


