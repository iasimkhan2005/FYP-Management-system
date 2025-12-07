import { useEffect, useState } from 'react'
import api from '../../utils/api'

const CoordinatorDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSupervisors: 0,
    pendingSchedules: 0,
    activePanels: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/coordinators/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="dashboard">
      <h1>Coordinator Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="stat-value">{stats.totalStudents}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Supervisors</h3>
          <div className="stat-value">{stats.totalSupervisors}</div>
        </div>
        
        <div className="stat-card">
          <h3>Pending Schedules</h3>
          <div className="stat-value">{stats.pendingSchedules}</div>
        </div>
        
        <div className="stat-card">
          <h3>Active Panels</h3>
          <div className="stat-value">{stats.activePanels}</div>
        </div>
      </div>
    </div>
  )
}

export default CoordinatorDashboard

