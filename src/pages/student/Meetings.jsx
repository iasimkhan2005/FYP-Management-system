import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const StudentMeetings = () => {
  const [meetings, setMeetings] = useState([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestData, setRequestData] = useState({
    date: '',
    time: '',
    agenda: ''
  })

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/students/meetings')
      setMeetings(response.data)
    } catch (error) {
      console.error('Error fetching meetings:', error)
    }
  }

  const handleRequestMeeting = async (e) => {
    e.preventDefault()
    try {
      await api.post('/students/meetings/request', requestData)
      toast.success('Meeting request sent successfully!')
      setShowRequestForm(false)
      setRequestData({ date: '', time: '', agenda: '' })
      fetchMeetings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request meeting')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Meetings</h1>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="btn btn-primary"
        >
          Request Meeting
        </button>
      </div>

      {showRequestForm && (
        <div className="card">
          <h2>Request Meeting with Supervisor</h2>
          <form onSubmit={handleRequestMeeting}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={requestData.date}
                onChange={(e) => setRequestData({ ...requestData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={requestData.time}
                onChange={(e) => setRequestData({ ...requestData, time: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Agenda</label>
              <textarea
                value={requestData.agenda}
                onChange={(e) => setRequestData({ ...requestData, agenda: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Send Request
            </button>
            <button
              type="button"
              onClick={() => setShowRequestForm(false)}
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Scheduled Meetings</h2>
        {meetings.length === 0 ? (
          <p>No meetings scheduled.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Agenda</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td>{formatDate(meeting.date)}</td>
                  <td>{meeting.time}</td>
                  <td>{meeting.agenda}</td>
                  <td>
                    <span className={`badge badge-${meeting.status === 'confirmed' ? 'success' : 'warning'}`}>
                      {meeting.status}
                    </span>
                  </td>
                  <td>{meeting.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default StudentMeetings

