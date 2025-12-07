import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import './Dashboard.css'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    proposalStatus: 'pending',
    srsStatus: 'pending',
    meetingsCount: 0,
    unreadMessages: 0
  })
  const [groupInfo, setGroupInfo] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, groupRes] = await Promise.all([
        api.get('/students/dashboard/stats'),
        api.get('/students/group')
      ])
      setStats(statsRes.data)
      setGroupInfo(groupRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'badge-success',
      rejected: 'badge-danger',
      pending: 'badge-warning',
      submitted: 'badge-info'
    }
    return badges[status] || 'badge-info'
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name || 'Student'}</h1>
      
      {groupInfo && (
        <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>Group Information</h2>
          <p style={{ fontSize: '18px', marginBottom: '15px' }}>
            <strong>Group Name:</strong> {groupInfo.name}
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '8px' }}>
            <p style={{ marginBottom: '10px', fontSize: '16px' }}><strong>Your Partner:</strong></p>
            {groupInfo.members.filter(m => m.id !== user?.id).map((partner) => (
              <div key={partner.id} style={{ 
                background: 'white', 
                color: '#333', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '10px'
              }}>
                <strong>{partner.name}</strong>
                <br />
                <small>Enrollment ID: {partner.enrollmentId}</small>
                <br />
                <small>Email: {partner.email}</small>
              </div>
            ))}
            {groupInfo.members.filter(m => m.id !== user?.id).length === 0 && (
              <p>No partner assigned yet</p>
            )}
          </div>
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Proposal Status</h3>
          <div className="stat-value">
            <span className={getStatusBadge(stats.proposalStatus)}>
              {stats.proposalStatus}
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>SRS Status</h3>
          <div className="stat-value">
            <span className={getStatusBadge(stats.srsStatus)}>
              {stats.srsStatus}
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Meetings</h3>
          <div className="stat-value">{stats.meetingsCount}</div>
        </div>
        
        <div className="stat-card">
          <h3>Unread Messages</h3>
          <div className="stat-value">{stats.unreadMessages}</div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <ul className="activity-list">
            {recentActivity.map((activity, index) => (
              <li key={index}>
                <span className="activity-time">
                  {new Date(activity.date).toLocaleString()}
                </span>
                <span className="activity-message">{activity.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard

