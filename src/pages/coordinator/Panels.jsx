import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'

const CoordinatorPanels = () => {
  const [panels, setPanels] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    members: []
  })
  const [availableMembers, setAvailableMembers] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [panelsRes, membersRes] = await Promise.all([
        api.get('/coordinators/panels'),
        api.get('/coordinators/panel-members')
      ])
      setPanels(panelsRes.data)
      setAvailableMembers(membersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.members.length === 0) {
      toast.error('Please select at least one panel member')
      return
    }
    try {
      await api.post('/coordinators/panels', formData)
      toast.success('Panel created successfully!')
      setShowForm(false)
      setFormData({ name: '', members: [] })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create panel')
    }
  }

  const toggleMember = (memberId) => {
    setFormData({
      ...formData,
      members: formData.members.includes(memberId)
        ? formData.members.filter(id => id !== memberId)
        : [...formData.members, memberId]
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Evaluation Panels</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          Create Panel
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Panel</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Panel Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Panel A, Panel B"
              />
            </div>
            <div className="form-group">
              <label>Panel Members</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableMembers.map((member) => (
                  <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.members.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                    />
                    {member.name} ({member.email})
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Panel
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
        <h2>Existing Panels</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Panel Name</th>
              <th>Members</th>
              <th>Active Evaluations</th>
            </tr>
          </thead>
          <tbody>
            {panels.map((panel) => (
              <tr key={panel.id}>
                <td>{panel.name}</td>
                <td>{panel.members.map(m => m.name).join(', ')}</td>
                <td>{panel.activeEvaluations || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CoordinatorPanels

