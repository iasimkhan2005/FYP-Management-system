import { useEffect, useState } from 'react'
import api from '../../utils/api'

const HodDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSupervisors: 0,
    totalGroups: 0,
    pendingProposals: 0,
    pendingSRS: 0,
    upcomingEvaluations: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Since we don't have a specific HOD API endpoint, we'll use coordinator data
      const response = await api.get('/coordinators/dashboard/stats')
      setStats({
        totalStudents: response.data.totalStudents || 0,
        totalSupervisors: response.data.totalSupervisors || 0,
        totalGroups: response.data.activePanels || 0,
        pendingProposals: response.data.pendingSchedules || 0,
        pendingSRS: 0,
        upcomingEvaluations: response.data.pendingSchedules || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="dashboard">
      <h1>HOD Dashboard</h1>
      
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
          <h3>Total Groups</h3>
          <div className="stat-value">{stats.totalGroups}</div>
        </div>
        
        <div className="stat-card">
          <h3>Pending Proposals</h3>
          <div className="stat-value">{stats.pendingProposals}</div>
        </div>
        
        <div className="stat-card">
          <h3>Pending SRS</h3>
          <div className="stat-value">{stats.pendingSRS}</div>
        </div>
        
        <div className="stat-card">
          <h3>Upcoming Evaluations</h3>
          <div className="stat-value">{stats.upcomingEvaluations}</div>
        </div>
      </div>

      <div className="card">
        <h2>Department Overview</h2>
        <p>Welcome to the Head of Department portal. Here you can oversee all FYP activities across the department.</p>
        <div className="department-stats">
          <div className="stat-item">
            <h4>Academic Year</h4>
            <p>2023-2024</p>
          </div>
          <div className="stat-item">
            <h4>Semester</h4>
            <p>Fall Semester</p>
          </div>
          <div className="stat-item">
            <h4>Programs</h4>
            <p>Computer Science, Software Engineering</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HodDashboard