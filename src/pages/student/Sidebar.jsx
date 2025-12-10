import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/proposals', label: 'Proposals' },
    { path: '/student/srs', label: 'SRS' },
    { path: '/student/progress', label: 'Progress Reports' },
    { path: '/student/meetings', label: 'Meetings' },
    { path: '/student/chat', label: 'Chat' },
    { path: '/student/marks', label: 'Marks' }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Quick Actions</h2>
      </div>
      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar