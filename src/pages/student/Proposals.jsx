import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { validateFileType, validateFileSize, formatDate } from '../../utils/auth'
import './Proposals.css'

const StudentProposals = () => {
  const [proposals, setProposals] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await api.get('/students/proposals')
      setProposals(response.data)
    } catch (error) {
      console.error('Error fetching proposals:', error)
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
    formData.append('type', 'proposal')

    try {
      await api.post('/students/proposals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Proposal uploaded successfully!')
      setSelectedFile(null)
      document.getElementById('file-input').value = ''
      fetchProposals()
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
    <div className="proposals-page">
      <h1>My Proposals</h1>

      <div className="card">
        <h2>Upload New Proposal</h2>
        <div className="upload-section">
          <input
            id="file-input"
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
            {uploading ? 'Uploading...' : 'Upload Proposal'}
          </button>
        </div>
        <p className="help-text">
          Allowed formats: PDF, DOC, DOCX, ZIP (Max size: 20MB)
        </p>
      </div>

      <div className="card">
        <h2>Proposal History</h2>
        {proposals.length === 0 ? (
          <p>No proposals submitted yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>File</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Review Date</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td>{proposal.title || 'Proposal Document'}</td>
                  <td>
                    <a
                      href={`/api/files/${proposal.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </td>
                  <td>
                    <span className={getStatusBadge(proposal.status)}>
                      {proposal.status}
                    </span>
                  </td>
                  <td>{formatDate(proposal.submittedAt)}</td>
                  <td>{formatDate(proposal.reviewedAt)}</td>
                  <td>{proposal.comments || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default StudentProposals

