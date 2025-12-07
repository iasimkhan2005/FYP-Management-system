import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const CoordinatorMarks = () => {
  const [evaluations, setEvaluations] = useState([])
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const fetchEvaluations = async () => {
    try {
      const response = await api.get('/coordinators/evaluations')
      setEvaluations(response.data)
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    }
  }

  const handlePublishMarks = async (evaluationId) => {
    try {
      await api.post(`/coordinators/evaluations/${evaluationId}/publish`)
      toast.success('Marks published successfully!')
      fetchEvaluations()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish marks')
    }
  }

  return (
    <div>
      <h1>Marks Management</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Type</th>
              <th>Date</th>
              <th>Panel</th>
              <th>Marks Submitted</th>
              <th>Total Marks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((evaluation) => (
              <tr key={evaluation.id}>
                <td>{evaluation.groupName}</td>
                <td>{evaluation.type}</td>
                <td>{formatDate(evaluation.date)}</td>
                <td>{evaluation.panelName}</td>
                <td>{evaluation.marksSubmitted}/{evaluation.panelSize}</td>
                <td>{evaluation.totalMarks || '-'}</td>
                <td>
                  <span className={`badge badge-${evaluation.status === 'published' ? 'success' : evaluation.status === 'pending' ? 'warning' : 'info'}`}>
                    {evaluation.status}
                  </span>
                </td>
                <td>
                  {evaluation.status === 'completed' && (
                    <button
                      onClick={() => handlePublishMarks(evaluation.id)}
                      className="btn btn-primary"
                    >
                      Publish Marks
                    </button>
                  )}
                  {evaluation.status === 'pending' && (
                    <button
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className="btn btn-secondary"
                    >
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvaluation && (
        <div className="card">
          <h2>Evaluation Details</h2>
          <p><strong>Group:</strong> {selectedEvaluation.groupName}</p>
          <p><strong>Type:</strong> {selectedEvaluation.type}</p>
          <p><strong>Panel Members:</strong> {selectedEvaluation.panelMembers?.join(', ')}</p>
          <p><strong>Marks Submitted:</strong> {selectedEvaluation.marksSubmitted}/{selectedEvaluation.panelSize}</p>
          <button
            onClick={() => setSelectedEvaluation(null)}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default CoordinatorMarks

