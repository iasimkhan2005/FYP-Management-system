import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'
import './Panel.css'

const PanelEvaluations = () => {
  const [evaluations, setEvaluations] = useState([])
  const [filteredEvaluations, setFilteredEvaluations] = useState([])
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)
  const [marks, setMarks] = useState({
    marks: '',
    comments: ''
  })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvaluations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [evaluations, filter, searchTerm])

  const fetchEvaluations = async () => {
    try {
      const response = await api.get('/panels/evaluations')
      setEvaluations(response.data)
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    }
  }

  const applyFilters = () => {
    let filtered = evaluations

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.status === filter)
    }

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(evaluation => 
        evaluation.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvaluations(filtered)
  }

  const handleSubmitMarks = async (evaluationId) => {
    if (!marks.marks || isNaN(marks.marks)) {
      toast.error('Please enter valid marks')
      return
    }

    // Validate marks range
    const marksValue = parseFloat(marks.marks)
    if (marksValue < 0 || marksValue > 100) {
      toast.error('Marks must be between 0 and 100')
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

  const closeModal = () => {
    setSelectedEvaluation(null)
    setMarks({ marks: '', comments: '' })
  }

  return (
    <div>
      <h1>Evaluations</h1>
      
      <div className="card">
        <div className="filters">
          <div className="form-group">
            <input
              type="text"
              placeholder="Search by group name or evaluation type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="form-group">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Evaluations</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Evaluation Schedule</h2>
        {filteredEvaluations.length === 0 ? (
          <p>No evaluations found matching your criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="evaluations-table">
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
                {filteredEvaluations.map((evaluation) => (
                  <tr key={evaluation.id}>
                    <td>{evaluation.groupName}</td>
                    <td>{evaluation.type}</td>
                    <td>{formatDate(evaluation.date)}</td>
                    <td>{evaluation.time}</td>
                    <td>{evaluation.venue}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(evaluation.status)}`}>
                        {evaluation.status}
                      </span>
                    </td>
                    <td>
                      {evaluation.status === 'pending' && (
                        <button
                          onClick={() => setSelectedEvaluation(evaluation)}
                          className="btn btn-primary btn-small"
                        >
                          Submit Marks
                        </button>
                      )}
                      {evaluation.status === 'completed' && (
                        <span className="status-completed">Marks Submitted</span>
                      )}
                      {evaluation.status === 'scheduled' && (
                        <span className="status-scheduled">Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEvaluation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Submit Evaluation Marks</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="form-group">
              <label><strong>Group:</strong> {selectedEvaluation.groupName}</label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><strong>Type:</strong> {selectedEvaluation.type}</label>
              </div>
              <div className="form-group">
                <label><strong>Date:</strong> {formatDate(selectedEvaluation.date)}</label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="marks">Marks (out of 100)</label>
              <input
                type="number"
                id="marks"
                min="0"
                max="100"
                step="0.1"
                value={marks.marks}
                onChange={(e) => setMarks({ ...marks, marks: e.target.value })}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                value={marks.comments}
                onChange={(e) => setMarks({ ...marks, comments: e.target.value })}
                placeholder="Enter your evaluation comments..."
                className="form-control"
                rows="4"
              />
            </div>
            
            <div className="action-buttons">
              <button
                onClick={() => handleSubmitMarks(selectedEvaluation.id)}
                className="btn btn-primary"
              >
                Submit Marks
              </button>
              <button
                onClick={closeModal}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelEvaluations