import { useState, useEffect } from 'react'
import api from '../../utils/api'

const HodMarks = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupMarks()
  }, [])

  const fetchGroupMarks = async () => {
    try {
      setLoading(true)
      // Using coordinator endpoint since we don't have a specific HOD endpoint
      const response = await api.get('/coordinators/groups/marks')
      setGroups(response.data || [])
    } catch (error) {
      console.error('Error fetching group marks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishMarks = async (groupId) => {
    try {
      await api.post(`/coordinators/groups/${groupId}/publish-marks`)
      alert('Marks published successfully!')
      fetchGroupMarks() // Refresh the data
    } catch (error) {
      console.error('Error publishing marks:', error)
      alert('Failed to publish marks')
    }
  }

  if (loading) {
    return <div className="loading">Loading marks data...</div>
  }

  return (
    <div className="marks-page">
      <h1>Department Marks Overview</h1>
      
      <div className="card">
        <h2>All Group Marks</h2>
        {groups.length === 0 ? (
          <p>No group marks available yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Supervisor</th>
                  <th>Proposal Marks</th>
                  <th>SRS Marks</th>
                  <th>Midterm Marks</th>
                  <th>Final Marks</th>
                  <th>Total Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.supervisorName}</td>
                    <td>{group.proposalMarks || 'N/A'}</td>
                    <td>{group.srsMarks || 'N/A'}</td>
                    <td>{group.midtermMarks || 'N/A'}</td>
                    <td>{group.finalMarks || 'N/A'}</td>
                    <td>
                      <strong>
                        {group.totalMarks ? group.totalMarks.toFixed(2) : 'N/A'}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${
                        group.marksPublished ? 'badge-success' : 'badge-warning'
                      }`}>
                        {group.marksPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      {!group.marksPublished && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handlePublishMarks(group.id)}
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Marks Summary</h2>
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Groups with Published Marks</h3>
            <div className="stat-value">
              {groups.filter(g => g.marksPublished).length}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Average Total Marks</h3>
            <div className="stat-value">
              {groups.filter(g => g.totalMarks).length > 0 
                ? (groups.reduce((sum, g) => sum + (g.totalMarks || 0), 0) / 
                   groups.filter(g => g.totalMarks).length).toFixed(2)
                : 'N/A'}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Highest Marks</h3>
            <div className="stat-value">
              {groups.filter(g => g.totalMarks).length > 0 
                ? Math.max(...groups.map(g => g.totalMarks || 0)).toFixed(2)
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HodMarks