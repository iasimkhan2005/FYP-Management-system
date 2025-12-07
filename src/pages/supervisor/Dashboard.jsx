import { useEffect, useState } from 'react'
import api from '../../utils/api'

const SupervisorDashboard = () => {
  const [stats, setStats] = useState({
    pendingProposals: 0,
    pendingSRS: 0,
    upcomingMeetings: 0,
    studentsCount: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/supervisors/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="dashboard">
      <h1>Supervisor Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Proposals</h3>
          <div className="stat-value">{stats.pendingProposals}</div>
        </div>
        
        <div className="stat-card">
          <h3>Pending SRS</h3>
          <div className="stat-value">{stats.pendingSRS}</div>
        </div>
        
        <div className="stat-card">
          <h3>Upcoming Meetings</h3>
          <div className="stat-value">{stats.upcomingMeetings}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Groups</h3>
          <div className="stat-value">{stats.groupsCount}</div>
        </div>
      </div>
    </div>
  )
}

export default SupervisorDashboard

