import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const SupervisorProposals = () => {
  const [proposals, setProposals] = useState([])
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [comments, setComments] = useState('')
  const [action, setAction] = useState('')

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await api.get('/supervisors/proposals')
      setProposals(response.data)
    } catch (error) {
      console.error('Error fetching proposals:', error)
    }
  }

  const handleReview = async (proposalId) => {
    if (!action) {
      toast.error('Please select approve or reject')
      return
    }

    try {
      await api.post(`/supervisors/proposals/${proposalId}/review`, {
        action,
        comments
      })
      toast.success(`Proposal ${action}ed successfully!`)
      setSelectedProposal(null)
      setComments('')
      setAction('')
      fetchProposals()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review failed')
    }
  }

  return (
    <div>
      <h1>Proposal Reviews</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Time Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id}>
                <td>{proposal.groupName}</td>
                <td>{formatDate(proposal.submittedAt)}</td>
                <td>
                  <span className={`badge badge-${proposal.status === 'approved' ? 'success' : proposal.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {proposal.status}
                  </span>
                </td>
                <td>
                  {proposal.timeRemaining ? `${proposal.timeRemaining} hours` : '-'}
                </td>
                <td>
                  <button
                    onClick={() => setSelectedProposal(proposal)}
                    className="btn btn-primary"
                    style={{ marginRight: '8px' }}
                  >
                    Review
                  </button>
                  <a
                    href={`/api/files/${proposal.filePath}`}
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

      {selectedProposal && (
        <div className="card">
          <h2>Review Proposal</h2>
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
            onClick={() => handleReview(selectedProposal.id)}
            className="btn btn-primary"
          >
            Submit Review
          </button>
          <button
            onClick={() => {
              setSelectedProposal(null)
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

export default SupervisorProposals

