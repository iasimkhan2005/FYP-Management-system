import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const SupervisorProgress = () => {
  const [progressReports, setProgressReports] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('all')

  useEffect(() => {
    fetchProgressReports()
  }, [selectedStudent])

  const fetchProgressReports = async () => {
    try {
      const url = selectedStudent === 'all'
        ? '/supervisors/progress'
        : `/supervisors/progress/${selectedStudent}`
      const response = await api.get(url)
      setProgressReports(response.data)
    } catch (error) {
      console.error('Error fetching progress reports:', error)
    }
  }

  return (
    <div>
      <h1>Student Progress Reports</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Month</th>
              <th>Submitted Date</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {progressReports.map((report) => (
              <tr key={report.id}>
                <td>{report.groupName}</td>
                <td>{report.month}</td>
                <td>{formatDate(report.submittedAt)}</td>
                <td>
                  <a
                    href={`/api/files/${report.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SupervisorProgress

