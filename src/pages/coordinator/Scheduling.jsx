import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const CoordinatorScheduling = () => {
  const [schedules, setSchedules] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    groupId: '',
    type: 'proposal',
    date: '',
    time: '',
    venue: '',
    panelId: ''
  })
  const [groups, setGroups] = useState([])
  const [panels, setPanels] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schedulesRes, groupsRes, panelsRes] = await Promise.all([
        api.get('/coordinators/schedules'),
        api.get('/coordinators/groups'),
        api.get('/coordinators/panels')
      ])
      setSchedules(schedulesRes.data)
      setGroups(groupsRes.data.filter(g => g.proposalStatus === 'approved'))
      setPanels(panelsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/coordinators/schedules', formData)
      toast.success('Schedule created successfully!')
      setShowForm(false)
      setFormData({
        groupId: '',
        type: 'proposal',
        date: '',
        time: '',
        venue: '',
        panelId: ''
      })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create schedule')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Scheduling</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          Create Schedule
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Schedule</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Group</label>
              <select
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                required
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="proposal">Proposal Defense</option>
                <option value="midterm">Midterm Evaluation</option>
                <option value="final">Final Evaluation</option>
              </select>
            </div>
            <div className="form-group">
              <label>Panel</label>
              <select
                value={formData.panelId}
                onChange={(e) => setFormData({ ...formData, panelId: e.target.value })}
                required
              >
                <option value="">Select Panel</option>
                {panels.map((panel) => (
                  <option key={panel.id} value={panel.id}>
                    {panel.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Schedule
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Scheduled Presentations</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Panel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td>{schedule.groupName}</td>
                <td>{schedule.type}</td>
                <td>{formatDate(schedule.date)}</td>
                <td>{schedule.time}</td>
                <td>{schedule.venue}</td>
                <td>{schedule.panelName}</td>
                <td>
                  <span className={`badge badge-${schedule.status === 'completed' ? 'success' : 'info'}`}>
                    {schedule.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CoordinatorScheduling

