import { useEffect, useState } from 'react'
import api from '../../utils/api'
import './Panel.css'

const PanelDashboard = () => {
  const [stats, setStats] = useState({
    pendingEvaluations: 0,
    completedEvaluations: 0,
    totalEvaluations: 0
  })
  const [upcomingEvaluations, setUpcomingEvaluations] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchUpcomingEvaluations()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/panels/dashboard/stats')
      setStats({
        pendingEvaluations: response.data.pendingEvaluations || 0,
        completedEvaluations: response.data.completedEvaluations || 0,
        totalEvaluations: (response.data.pendingEvaluations || 0) + (response.data.completedEvaluations || 0)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchUpcomingEvaluations = async () => {
    try {
      const response = await api.get('/panels/evaluations?limit=5')
      setUpcomingEvaluations(response.data || [])
    } catch (error) {
      console.error('Error fetching upcoming evaluations:', error)
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed'
      case 'pending':
        return 'status-pending'
      case 'scheduled':
        return 'status-scheduled'
      default:
        return 'status-pending'
    }
  }

  return (
    <div className="dashboard">
      <h1>Panel Member Dashboard</h1>
      
      <div className="panel-dashboard">
        <div className="stat-card">
          <h3>Total Evaluations</h3>
          <div className="stat-value">{stats.totalEvaluations}</div>
        </div>
        
        <div className="stat-card">
          <h3>Pending Evaluations</h3>
          <div className="stat-value">{stats.pendingEvaluations}</div>
        </div>
        
        <div className="stat-card">
          <h3>Completed Evaluations</h3>
          <div className="stat-value">{stats.completedEvaluations}</div>
        </div>
      </div>

      <div className="card">
        <h2>Upcoming Evaluations</h2>
        {upcomingEvaluations.length === 0 ? (
          <p>No upcoming evaluations scheduled.</p>
        ) : (
          <div className="evaluations-list">
            {upcomingEvaluations.map((evaluation) => (
              <div className="evaluation-card" key={evaluation.id}>
                <h3>{evaluation.groupName}</h3>
                <div className="evaluation-details">
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{evaluation.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{evaluation.date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{evaluation.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Venue</span>
                    <span className="detail-value">{evaluation.venue}</span>
                  </div>
                </div>
                <span className={`status-badge ${getStatusClass(evaluation.status)}`}>
                  {evaluation.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Panel Member Guidelines</h2>
        <ul>
          <li>Review all group documentation before evaluations</li>
          <li>Provide constructive feedback to help students improve</li>
          <li>Ensure all evaluations are completed before deadlines</li>
          <li>Maintain confidentiality of student information</li>
          <li>Communicate with coordinators for any scheduling conflicts</li>
        </ul>
      </div>
    </div>
  )
}

export default PanelDashboard