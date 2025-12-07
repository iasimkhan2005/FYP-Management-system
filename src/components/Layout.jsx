import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import './Layout.css'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()

  const getNavLinks = () => {
    if (!user) return []

    const roleLinks = {
      student: [
        { path: '/student/dashboard', label: 'Dashboard' },
        { path: '/student/proposals', label: 'Proposals' },
        { path: '/student/srs', label: 'SRS' },
        { path: '/student/progress', label: 'Progress' },
        { path: '/student/meetings', label: 'Meetings' },
        { path: '/student/chat', label: 'Chat' },
        { path: '/student/marks', label: 'Marks' }
      ],
      supervisor: [
        { path: '/supervisor/dashboard', label: 'Dashboard' },
        { path: '/supervisor/proposals', label: 'Proposals' },
        { path: '/supervisor/srs', label: 'SRS' },
        { path: '/supervisor/meetings', label: 'Meetings' },
        { path: '/supervisor/chat', label: 'Chat' },
        { path: '/supervisor/progress', label: 'Progress' }
      ],
      coordinator: [
        { path: '/coordinator/dashboard', label: 'Dashboard' },
        { path: '/coordinator/students', label: 'Students' },
        { path: '/coordinator/scheduling', label: 'Scheduling' },
        { path: '/coordinator/panels', label: 'Panels' },
        { path: '/coordinator/marks', label: 'Marks' }
      ],
      panel: [
        { path: '/panel/dashboard', label: 'Dashboard' },
        { path: '/panel/evaluations', label: 'Evaluations' }
      ],
      hod: [
        { path: '/coordinator/dashboard', label: 'Dashboard' },
        { path: '/coordinator/marks', label: 'Marks' }
      ]
    }

    return roleLinks[user.role] || []
  }

  const navLinks = getNavLinks()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">FYP Management System</h1>
          <nav className="nav">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="notifications-dropdown">
              <button className="notification-btn">
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              <div className="notifications-menu">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead}>Mark all as read</button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map(notif => (
                      <div
                        key={notif.id}
                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p>{notif.message}</p>
                        <small>{new Date(notif.createdAt).toLocaleString()}</small>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="user-menu">
              <span>{user?.name || user?.email}</span>
              <span className="role-badge">{user?.role}</span>
              <button onClick={() => { logout(); navigate('/login') }} className="btn btn-secondary">Logout</button>
            </div>
          </div>
        </div>
      </header>
      <main className="main-content">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}

export default Layout

