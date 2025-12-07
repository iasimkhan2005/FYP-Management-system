import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const StudentMarks = () => {
  const [marks, setMarks] = useState(null)

  useEffect(() => {
    fetchMarks()
  }, [])

  const fetchMarks = async () => {
    try {
      const response = await api.get('/students/marks')
      setMarks(response.data)
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching marks:', error)
      }
    }
  }

  return (
    <div>
      <h1>My Marks</h1>
      {!marks ? (
        <div className="card">
          <p>Marks are not available yet. They will be published after evaluation and HOD approval.</p>
        </div>
      ) : (
        <div className="card">
          <h2>Evaluation Marks</h2>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Proposal Defense</strong></td>
                <td>{marks.proposalDefense || '-'}</td>
              </tr>
              <tr>
                <td><strong>Midterm Evaluation</strong></td>
                <td>{marks.midterm || '-'}</td>
              </tr>
              <tr>
                <td><strong>Final Evaluation</strong></td>
                <td>{marks.final || '-'}</td>
              </tr>
              <tr>
                <td><strong>Total Marks</strong></td>
                <td><strong>{marks.total || '-'}</strong></td>
              </tr>
              <tr>
                <td><strong>Published Date</strong></td>
                <td>{formatDate(marks.publishedAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StudentMarks

