import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { validateFileType, validateFileSize, formatDate } from '../../utils/auth'

const StudentProgress = () => {
  const [progressReports, setProgressReports] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [month, setMonth] = useState('')

  useEffect(() => {
    fetchProgressReports()
  }, [])

  const fetchProgressReports = async () => {
    try {
      const response = await api.get('/students/progress')
      setProgressReports(response.data)
    } catch (error) {
      console.error('Error fetching progress reports:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!validateFileType(file)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, or ZIP files only.')
      return
    }

    if (!validateFileSize(file)) {
      toast.error('File size exceeds 20MB limit.')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !month) {
      toast.error('Please select a file and month')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('month', month)

    try {
      await api.post('/students/progress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Progress report uploaded successfully!')
      setSelectedFile(null)
      setMonth('')
      document.getElementById('progress-file-input').value = ''
      fetchProgressReports()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1>Monthly Progress Reports</h1>

      <div className="card">
        <h2>Upload Progress Report</h2>
        <div className="upload-section">
          <div className="form-group">
            <label>Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>
          <input
            id="progress-file-input"
            type="file"
            accept=".pdf,.doc,.docx,.zip"
            onChange={handleFileChange}
            className="file-input"
          />
          {selectedFile && (
            <div className="file-info">
              <p>
                <strong>Selected:</strong> {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !month || uploading}
            className="btn btn-primary"
          >
            {uploading ? 'Uploading...' : 'Upload Progress Report'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Progress History</h2>
        {progressReports.length === 0 ? (
          <p>No progress reports submitted yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>File</th>
                <th>Submitted Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {progressReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.month}</td>
                  <td>
                    <a
                      href={`/api/files/${report.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </td>
                  <td>{formatDate(report.submittedAt)}</td>
                  <td>
                    <span className="badge badge-success">Submitted</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default StudentProgress

