import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { validateFileType, validateFileSize, formatDate } from '../../utils/auth'

const StudentSRS = () => {
  const [srs, setSrs] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSRS()
  }, [])

  const fetchSRS = async () => {
    try {
      const response = await api.get('/students/srs')
      setSrs(response.data)
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching SRS:', error)
      }
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
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('type', 'srs')

    try {
      await api.post('/students/srs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('SRS uploaded successfully!')
      setSelectedFile(null)
      document.getElementById('srs-file-input').value = ''
      fetchSRS()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'badge-success',
      rejected: 'badge-danger',
      pending: 'badge-warning',
      submitted: 'badge-info'
    }
    return badges[status] || 'badge-info'
  }

  return (
    <div>
      <h1>SRS Submission</h1>
      {!srs ? (
        <div className="card">
          <h2>Upload SRS Document</h2>
          <p>Your proposal must be approved before you can upload SRS.</p>
          <div className="upload-section">
            <input
              id="srs-file-input"
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
              disabled={!selectedFile || uploading}
              className="btn btn-primary"
            >
              {uploading ? 'Uploading...' : 'Upload SRS'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>SRS Status</h2>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Status</strong></td>
                <td>
                  <span className={getStatusBadge(srs.status)}>
                    {srs.status}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Submitted Date</strong></td>
                <td>{formatDate(srs.submittedAt)}</td>
              </tr>
              <tr>
                <td><strong>Review Date</strong></td>
                <td>{formatDate(srs.reviewedAt) || '-'}</td>
              </tr>
              <tr>
                <td><strong>File</strong></td>
                <td>
                  <a
                    href={`/api/files/${srs.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download SRS
                  </a>
                </td>
              </tr>
              {srs.comments && (
                <tr>
                  <td><strong>Comments</strong></td>
                  <td>{srs.comments}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StudentSRS

