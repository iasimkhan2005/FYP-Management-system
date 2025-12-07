import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const SupervisorSRS = () => {
  const [srsList, setSrsList] = useState([])
  const [selectedSRS, setSelectedSRS] = useState(null)
  const [comments, setComments] = useState('')
  const [action, setAction] = useState('')

  useEffect(() => {
    fetchSRSList()
  }, [])

  const fetchSRSList = async () => {
    try {
      const response = await api.get('/supervisors/srs')
      setSrsList(response.data)
    } catch (error) {
      console.error('Error fetching SRS list:', error)
    }
  }

  const handleReview = async (srsId) => {
    if (!action) {
      toast.error('Please select approve or reject')
      return
    }

    try {
      await api.post(`/supervisors/srs/${srsId}/review`, {
        action,
        comments
      })
      toast.success(`SRS ${action}ed successfully!`)
      setSelectedSRS(null)
      setComments('')
      setAction('')
      fetchSRSList()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review failed')
    }
  }

  return (
    <div>
      <h1>SRS Reviews</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {srsList.map((srs) => (
              <tr key={srs.id}>
                <td>{srs.groupName}</td>
                <td>{formatDate(srs.submittedAt)}</td>
                <td>
                  <span className={`badge badge-${srs.status === 'approved' ? 'success' : srs.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {srs.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedSRS(srs)}
                    className="btn btn-primary"
                    style={{ marginRight: '8px' }}
                  >
                    Review
                  </button>
                  <a
                    href={`/api/files/${srs.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSRS && (
        <div className="card">
          <h2>Review SRS</h2>
          <div className="form-group">
            <label>Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
            >
              <option value="">Select Action</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your comments..."
            />
          </div>
          <button
            onClick={() => handleReview(selectedSRS.id)}
            className="btn btn-primary"
          >
            Submit Review
          </button>
          <button
            onClick={() => {
              setSelectedSRS(null)
              setComments('')
              setAction('')
            }}
            className="btn btn-secondary"
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default SupervisorSRS

