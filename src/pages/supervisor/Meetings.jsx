import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const SupervisorMeetings = () => {
  const [meetings, setMeetings] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/supervisors/meetings')
      setMeetings(response.data)
    } catch (error) {
      console.error('Error fetching meetings:', error)
    }
  }

  const handleConfirmMeeting = async (meetingId) => {
    try {
      await api.post(`/supervisors/meetings/${meetingId}/confirm`)
      toast.success('Meeting confirmed!')
      fetchMeetings()
    } catch (error) {
      toast.error('Failed to confirm meeting')
    }
  }

  const handleAddNotes = async (meetingId) => {
    try {
      await api.post(`/supervisors/meetings/${meetingId}/notes`, { notes })
      toast.success('Notes added successfully!')
      setSelectedMeeting(null)
      setNotes('')
      fetchMeetings()
    } catch (error) {
      toast.error('Failed to add notes')
    }
  }

  return (
    <div>
      <h1>Meetings</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Date</th>
              <th>Time</th>
              <th>Agenda</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id}>
                <td>{meeting.groupName}</td>
                <td>{formatDate(meeting.date)}</td>
                <td>{meeting.time}</td>
                <td>{meeting.agenda}</td>
                <td>
                  <span className={`badge badge-${meeting.status === 'confirmed' ? 'success' : 'warning'}`}>
                    {meeting.status}
                  </span>
                </td>
                <td>
                  {meeting.status === 'pending' && (
                    <button
                      onClick={() => handleConfirmMeeting(meeting.id)}
                      className="btn btn-success"
                      style={{ marginRight: '8px' }}
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMeeting(meeting)}
                    className="btn btn-primary"
                  >
                    {meeting.notes ? 'View/Edit Notes' : 'Add Notes'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMeeting && (
        <div className="card">
          <h2>Meeting Notes</h2>
          {selectedMeeting.notes && (
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
              <strong>Current Notes:</strong>
              <p>{selectedMeeting.notes}</p>
            </div>
          )}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter meeting notes..."
            />
          </div>
          <button
            onClick={() => handleAddNotes(selectedMeeting.id)}
            className="btn btn-primary"
          >
            Save Notes
          </button>
          <button
            onClick={() => {
              setSelectedMeeting(null)
              setNotes('')
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

export default SupervisorMeetings

