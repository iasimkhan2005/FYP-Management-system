import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const PanelEvaluations = () => {
  const [evaluations, setEvaluations] = useState([])
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)
  const [marks, setMarks] = useState({
    marks: '',
    comments: ''
  })

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const fetchEvaluations = async () => {
    try {
      const response = await api.get('/panels/evaluations')
      setEvaluations(response.data)
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    }
  }

  const handleSubmitMarks = async (evaluationId) => {
    if (!marks.marks || isNaN(marks.marks)) {
      toast.error('Please enter valid marks')
      return
    }

    try {
      await api.post(`/panels/evaluations/${evaluationId}/marks`, marks)
      toast.success('Marks submitted successfully!')
      setSelectedEvaluation(null)
      setMarks({ marks: '', comments: '' })
      fetchEvaluations()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit marks')
    }
  }

  return (
    <div>
      <h1>Evaluations</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
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
                <td>{evaluation.time}</td>
                <td>{evaluation.venue}</td>
                <td>
                  <span className={`badge badge-${evaluation.status === 'completed' ? 'success' : 'warning'}`}>
                    {evaluation.status}
                  </span>
                </td>
                <td>
                  {evaluation.status === 'pending' && (
                    <button
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className="btn btn-primary"
                    >
                      Submit Marks
                    </button>
                  )}
                  {evaluation.status === 'completed' && (
                    <span>Marks Submitted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvaluation && (
        <div className="card">
          <h2>Submit Evaluation Marks</h2>
          <p><strong>Group:</strong> {selectedEvaluation.groupName}</p>
          <p><strong>Type:</strong> {selectedEvaluation.type}</p>
          <p><strong>Date:</strong> {formatDate(selectedEvaluation.date)}</p>
          
          <div className="form-group">
            <label>Marks (out of 100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={marks.marks}
              onChange={(e) => setMarks({ ...marks, marks: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea
              value={marks.comments}
              onChange={(e) => setMarks({ ...marks, comments: e.target.value })}
              placeholder="Enter your evaluation comments..."
            />
          </div>
          <button
            onClick={() => handleSubmitMarks(selectedEvaluation.id)}
            className="btn btn-primary"
          >
            Submit Marks
          </button>
          <button
            onClick={() => {
              setSelectedEvaluation(null)
              setMarks({ marks: '', comments: '' })
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

export default PanelEvaluations

