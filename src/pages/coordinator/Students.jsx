import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatDate } from '../../utils/auth'

const CoordinatorStudents = () => {
  const [groups, setGroups] = useState([])
  const [students, setStudents] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [groupForm, setGroupForm] = useState({
    name: '',
    studentIds: [],
    supervisorId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsRes, studentsRes, supervisorsRes] = await Promise.all([
        api.get('/coordinators/groups'),
        api.get('/coordinators/students'),
        api.get('/coordinators/supervisors')
      ])
      setGroups(groupsRes.data)
      setStudents(studentsRes.data.filter(s => !s.groupId))
      setSupervisors(supervisorsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (groupForm.studentIds.length !== 2) {
      toast.error('Please select exactly 2 students for the group')
      return
    }

    try {
      await api.post('/coordinators/groups', groupForm)
      toast.success('Group created successfully!')
      setShowGroupForm(false)
      setGroupForm({ name: '', studentIds: [], supervisorId: '' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group')
    }
  }

  const handleAssignSupervisor = async (groupId, supervisorId) => {
    try {
      await api.post(`/coordinators/groups/${groupId}/assign-supervisor`, { supervisorId })
      toast.success('Supervisor assigned successfully!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign supervisor')
    }
  }

  const toggleStudent = (studentId) => {
    setGroupForm({
      ...groupForm,
      studentIds: groupForm.studentIds.includes(studentId)
        ? groupForm.studentIds.filter(id => id !== studentId)
        : groupForm.studentIds.length < 2
        ? [...groupForm.studentIds, studentId]
        : groupForm.studentIds
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Groups & Students</h1>
        <button
          onClick={() => setShowGroupForm(!showGroupForm)}
          className="btn btn-primary"
        >
          Create Group
        </button>
      </div>

      {showGroupForm && (
        <div className="card">
          <h2>Create New Group</h2>
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label>Group Name</label>
              <input
                type="text"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                required
                placeholder="e.g., Group 1, Group 2"
              />
            </div>
            <div className="form-group">
              <label>Select 2 Students (Unassigned)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {students.length === 0 ? (
                  <p>No unassigned students available</p>
                ) : (
                  students.map((student) => (
                    <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={groupForm.studentIds.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        disabled={!groupForm.studentIds.includes(student.id) && groupForm.studentIds.length >= 2}
                      />
                      {student.name} ({student.enrollmentId})
                    </label>
                  ))
                )}
              </div>
              <small>Selected: {groupForm.studentIds.length}/2</small>
            </div>
            <div className="form-group">
              <label>Supervisor (Optional - can assign later)</label>
              <select
                value={groupForm.supervisorId}
                onChange={(e) => setGroupForm({ ...groupForm, supervisorId: e.target.value })}
              >
                <option value="">Select Supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.name} ({supervisor.groupsCount || 0}/2 groups)
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={groupForm.studentIds.length !== 2}>
              Create Group
            </button>
            <button
              type="button"
              onClick={() => {
                setShowGroupForm(false)
                setGroupForm({ name: '', studentIds: [], supervisorId: '' })
              }}
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Groups</h2>
        {groups.length === 0 ? (
          <p>No groups created yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Members</th>
                <th>Supervisor</th>
                <th>Proposal Status</th>
                <th>SRS Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>
                    {group.members.map(m => m.name).join(', ')}
                  </td>
                  <td>
                    {group.supervisorName || (
                      <select
                        onChange={(e) => handleAssignSupervisor(group.id, e.target.value)}
                        defaultValue=""
                        className="form-group"
                        style={{ padding: '4px', fontSize: '14px' }}
                      >
                        <option value="">Assign Supervisor</option>
                        {supervisors
                          .filter(s => (s.groupsCount || 0) < 2)
                          .map((supervisor) => (
                            <option key={supervisor.id} value={supervisor.id}>
                              {supervisor.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${group.proposalStatus === 'approved' ? 'success' : group.proposalStatus === 'rejected' ? 'danger' : 'warning'}`}>
                      {group.proposalStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${group.srsStatus === 'approved' ? 'success' : group.srsStatus === 'rejected' ? 'danger' : 'warning'}`}>
                      {group.srsStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    {group.supervisorName && (
                      <button
                        onClick={() => {
                          const newSupervisorId = prompt('Enter new supervisor ID or leave empty to unassign')
                          if (newSupervisorId !== null) {
                            handleAssignSupervisor(group.id, newSupervisorId || null)
                          }
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Change Supervisor
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Unassigned Students</h2>
        {students.length === 0 ? (
          <p>All students are assigned to groups.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Enrollment ID</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.enrollmentId}</td>
                  <td>{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default CoordinatorStudents
