import { useEffect, useState } from 'react'
import api from '../../utils/api'

const PanelDashboard = () => {
  const [stats, setStats] = useState({
    pendingEvaluations: 0,
    completedEvaluations: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/panels/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="dashboard">
      <h1>Panel Member Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Evaluations</h3>
          <div className="stat-value">{stats.pendingEvaluations}</div>
        </div>
        
        <div className="stat-card">
          <h3>Completed Evaluations</h3>
          <div className="stat-value">{stats.completedEvaluations}</div>
        </div>
      </div>
    </div>
  )
}

export default PanelDashboard

